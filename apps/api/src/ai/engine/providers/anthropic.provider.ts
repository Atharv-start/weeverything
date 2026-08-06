/**
 * anthropic.provider.ts
 * Anthropic Claude adapter stub — activates when ANTHROPIC_API_KEY is set.
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
export class AnthropicProvider implements IAiProvider {
  readonly providerName: AiProvider = 'anthropic';
  readonly defaultModel = 'claude-3-5-haiku-20241022';
  readonly defaultEmbeddingModel = 'voyage-3-lite'; // via Voyage AI

  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly apiKey: string | null;
  private readonly baseUrl = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY ?? null;
    if (!this.apiKey) {
      this.logger.log('ANTHROPIC_API_KEY not set – AnthropicProvider unavailable');
    }
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  async generate(request: AiGenerateRequest): Promise<AiGenerateResponse> {
    if (!this.apiKey) throw new Error('AnthropicProvider not configured');

    const started = Date.now();
    const model = request.options?.model ?? this.defaultModel;

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: request.options?.maxTokens ?? 2048,
        system: request.options?.systemPrompt,
        messages: request.messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
      model: string;
      usage: { input_tokens: number; output_tokens: number };
    };

    const content = data.content.find((c) => c.type === 'text')?.text ?? '';

    return {
      content,
      provider: this.providerName,
      model: data.model,
      promptTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      latencyMs: Date.now() - started,
      cached: false,
    };
  }

  async *generateStream(request: AiGenerateRequest): AsyncIterable<AiStreamChunk> {
    if (!this.apiKey) throw new Error('AnthropicProvider not configured');

    const model = request.options?.model ?? this.defaultModel;
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: request.options?.maxTokens ?? 2048,
        stream: true,
        system: request.options?.systemPrompt,
        messages: request.messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) { yield { delta: '', done: true }; return; }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n').filter(Boolean);
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const payload = JSON.parse(line.replace('data: ', '')) as {
              type: string;
              delta?: { type: string; text: string };
            };
            if (payload.type === 'content_block_delta' && payload.delta?.text) {
              yield { delta: payload.delta.text, done: false };
            }
          } catch {
            // skip
          }
        }
      }
    }

    yield { delta: '', done: true };
  }

  async embed(_request: AiEmbedRequest): Promise<AiEmbedResponse> {
    // Anthropic doesn't natively provide embeddings; stub returns empty
    // In production this would route to Voyage AI
    this.logger.warn('Anthropic embedding not implemented — returning empty embeddings');
    return {
      embeddings: _request.texts.map(() => []),
      model: this.defaultEmbeddingModel,
      provider: this.providerName,
    };
  }
}
