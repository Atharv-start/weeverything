/**
 * openai.provider.ts
 * OpenAI adapter stub — activates automatically when OPENAI_API_KEY is set.
 * Uses fetch directly to avoid adding the openai npm package as a hard dependency.
 */

import { Injectable, Logger } from '@nestjs/common';
import type {
  IAiProvider,
  AiProvider,
  AiGenerateRequest,
  AiGenerateResponse,
  AiEmbedRequest,
  AiEmbedResponse,
  AiStreamChunk,
} from '../engine.types';

@Injectable()
export class OpenAIProvider implements IAiProvider {
  readonly providerName: AiProvider = 'openai';
  readonly defaultModel = 'gpt-4o-mini';
  readonly defaultEmbeddingModel = 'text-embedding-3-small';

  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly apiKey: string | null;
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY ?? null;
    if (!this.apiKey) {
      this.logger.log('OPENAI_API_KEY not set – OpenAIProvider unavailable');
    }
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  async generate(request: AiGenerateRequest): Promise<AiGenerateResponse> {
    if (!this.apiKey) throw new Error('OpenAIProvider not configured');

    const started = Date.now();
    const model = request.options?.model ?? this.defaultModel;

    const messages = request.options?.systemPrompt
      ? [{ role: 'system', content: request.options.systemPrompt }, ...request.messages]
      : request.messages;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: request.options?.maxTokens ?? 2048,
        temperature: request.options?.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number };
      model: string;
    };

    return {
      content: data.choices[0].message.content,
      provider: this.providerName,
      model: data.model,
      promptTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
      latencyMs: Date.now() - started,
      cached: false,
    };
  }

  async *generateStream(request: AiGenerateRequest): AsyncIterable<AiStreamChunk> {
    if (!this.apiKey) throw new Error('OpenAIProvider not configured');

    const model = request.options?.model ?? this.defaultModel;
    const messages = request.options?.systemPrompt
      ? [{ role: 'system', content: request.options.systemPrompt }, ...request.messages]
      : request.messages;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      yield { delta: '', done: true };
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '));
      for (const line of lines) {
        const payload = line.replace('data: ', '');
        if (payload === '[DONE]') {
          yield { delta: '', done: true };
          return;
        }
        try {
          const parsed = JSON.parse(payload) as {
            choices: Array<{ delta: { content?: string } }>;
          };
          const text = parsed.choices[0]?.delta?.content ?? '';
          if (text) yield { delta: text, done: false };
        } catch {
          // skip malformed chunks
        }
      }
    }

    yield { delta: '', done: true };
  }

  async embed(request: AiEmbedRequest): Promise<AiEmbedResponse> {
    if (!this.apiKey) throw new Error('OpenAIProvider not configured');

    const model = request.model ?? this.defaultEmbeddingModel;
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model, input: request.texts }),
    });

    const data = (await response.json()) as {
      data: Array<{ embedding: number[] }>;
      model: string;
    };

    return {
      embeddings: data.data.map((d) => d.embedding),
      model: data.model,
      provider: this.providerName,
    };
  }
}
