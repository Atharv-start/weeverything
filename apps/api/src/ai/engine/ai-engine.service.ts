/**
 * ai-engine.service.ts
 * Central AI Engine — the single entry point for all AI generation, embedding,
 * and streaming in WeEverything.
 *
 * Provider selection priority:
 *  1. AI_DEFAULT_PROVIDER env var
 *  2. First available provider (checks API key presence)
 *  3. Falls back to a safe stub response
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import type {
  IAiProvider,
  AiProvider,
  AiGenerateRequest,
  AiGenerateResponse,
  AiEmbedRequest,
  AiEmbedResponse,
  AiStreamChunk,
  AiGenerateOptions,
  AiMessage,
} from './engine.types';

@Injectable()
export class AiEngineService implements OnModuleInit {
  private readonly logger = new Logger(AiEngineService.name);
  private readonly providers: Map<AiProvider, IAiProvider>;
  private activeProvider!: IAiProvider;

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly openai: OpenAIProvider,
    private readonly anthropic: AnthropicProvider,
  ) {
    this.providers = new Map<AiProvider, IAiProvider>([
      ['gemini', this.gemini as IAiProvider],
      ['openai', this.openai as IAiProvider],
      ['anthropic', this.anthropic as IAiProvider],
    ]);
  }

  onModuleInit() {
    const preferred = (process.env.AI_DEFAULT_PROVIDER as AiProvider | undefined) ?? 'gemini';

    // Try preferred first, then fall back through the list
    const order: AiProvider[] = [preferred, 'gemini', 'openai', 'anthropic'];
    for (const name of order) {
      const provider = this.providers.get(name);
      if (provider?.isAvailable()) {
        this.activeProvider = provider;
        this.logger.log(`AI Engine initialized — active provider: ${name}`);
        return;
      }
    }

    this.logger.warn('No AI provider configured — using stub fallback. Set GEMINI_API_KEY to enable AI features.');
    // Install a safe no-op stub so the app never crashes
    this.activeProvider = this.buildStubProvider();
  }

  /** Generate a completion using the active provider */
  async generate(
    messages: AiMessage[],
    options?: AiGenerateOptions,
  ): Promise<AiGenerateResponse> {
    const request: AiGenerateRequest = { messages, options };
    return this.activeProvider.generate(request);
  }

  /** Stream a completion using SSE — yields text chunks */
  async *stream(
    messages: AiMessage[],
    options?: AiGenerateOptions,
  ): AsyncIterable<AiStreamChunk> {
    const request: AiGenerateRequest = { messages, options };
    yield* this.activeProvider.generateStream(request);
  }

  /** Embed one or more texts */
  async embed(texts: string[], model?: string): Promise<AiEmbedResponse> {
    const request: AiEmbedRequest = { texts, model };
    return this.activeProvider.embed(request);
  }

  /** Quick single-prompt helper — wraps generate() with a single user message */
  async ask(prompt: string, options?: AiGenerateOptions): Promise<string> {
    const response = await this.generate([{ role: 'user', content: prompt }], options);
    return response.content;
  }

  /** Returns metadata about the currently active provider */
  getActiveProviderInfo() {
    return {
      provider: this.activeProvider.providerName,
      model: this.activeProvider.defaultModel,
      available: this.activeProvider.isAvailable(),
    };
  }

  /** Returns all registered providers and their availability */
  getAllProviderStatus() {
    return Array.from(this.providers.entries()).map(([name, p]) => ({
      provider: name,
      available: p.isAvailable(),
      defaultModel: p.defaultModel,
    }));
  }

  private buildStubProvider(): IAiProvider {
    return {
      providerName: 'gemini',
      defaultModel: 'stub',
      defaultEmbeddingModel: 'stub',
      isAvailable: () => false,
      generate: async () => ({
        content: 'AI features are not configured. Please set GEMINI_API_KEY in your .env file.',
        provider: 'gemini' as AiProvider,
        model: 'stub',
        promptTokens: 0,
        outputTokens: 0,
        latencyMs: 0,
        cached: false,
      }),
      generateStream: async function* () {
        yield {
          delta: 'AI features are not configured. Please set GEMINI_API_KEY in your .env file.',
          done: false,
        };
        yield { delta: '', done: true };
      },
      embed: async (req) => ({
        embeddings: req.texts.map(() => new Array(768).fill(0) as number[]),
        model: 'stub',
        provider: 'gemini' as AiProvider,
      }),
    };
  }
}
