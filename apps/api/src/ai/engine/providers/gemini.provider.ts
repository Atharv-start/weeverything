/**
 * gemini.provider.ts
 * Google Gemini adapter implementing IAiProvider.
 * Activated when AI_DEFAULT_PROVIDER=gemini or GEMINI_API_KEY is set.
 */

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
export class GeminiProvider implements IAiProvider {
  readonly providerName: AiProvider = 'gemini';
  readonly defaultModel = 'gemini-1.5-flash';
  readonly defaultEmbeddingModel = 'text-embedding-004';

  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenerativeAI | null = null;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      this.client = new GoogleGenerativeAI(key);
    } else {
      this.logger.warn('GEMINI_API_KEY not set – GeminiProvider unavailable');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generate(request: AiGenerateRequest): Promise<AiGenerateResponse> {
    if (!this.client) {
      throw new Error('GeminiProvider not configured (missing GEMINI_API_KEY)');
    }

    const modelName = request.options?.model ?? this.defaultModel;
    const started = Date.now();

    const geminiModel = this.client.getGenerativeModel({
      model: modelName,
      systemInstruction: request.options?.systemPrompt,
      generationConfig: {
        maxOutputTokens: request.options?.maxTokens ?? 2048,
        temperature: request.options?.temperature ?? 0.7,
        topP: request.options?.topP ?? 0.9,
      },
    });

    // Build chat history for multi-turn (all but last message)
    const history = request.messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = request.messages[request.messages.length - 1];
    const chat = geminiModel.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const responseText = result.response.text();

    const usageMeta = result.response.usageMetadata;

    return {
      content: responseText,
      provider: this.providerName,
      model: modelName,
      promptTokens: usageMeta?.promptTokenCount ?? 0,
      outputTokens: usageMeta?.candidatesTokenCount ?? 0,
      latencyMs: Date.now() - started,
      cached: false,
    };
  }

  async *generateStream(request: AiGenerateRequest): AsyncIterable<AiStreamChunk> {
    if (!this.client) {
      throw new Error('GeminiProvider not configured');
    }

    const modelName = request.options?.model ?? this.defaultModel;
    const geminiModel = this.client.getGenerativeModel({
      model: modelName,
      systemInstruction: request.options?.systemPrompt,
      generationConfig: {
        maxOutputTokens: request.options?.maxTokens ?? 2048,
        temperature: request.options?.temperature ?? 0.7,
      },
    });

    const history = request.messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = request.messages[request.messages.length - 1];
    const chat = geminiModel.startChat({ history });
    const streamResult = await chat.sendMessageStream(lastMessage.content);

    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        yield { delta: text, done: false };
      }
    }
    yield { delta: '', done: true };
  }

  async embed(request: AiEmbedRequest): Promise<AiEmbedResponse> {
    if (!this.client) {
      throw new Error('GeminiProvider not configured');
    }

    const modelName = request.model ?? this.defaultEmbeddingModel;
    const embedModel = this.client.getGenerativeModel({ model: modelName });

    const embeddings: number[][] = [];
    for (const text of request.texts) {
      const result = await embedModel.embedContent(text);
      embeddings.push(result.embedding.values);
    }

    return {
      embeddings,
      model: modelName,
      provider: this.providerName,
    };
  }
}
