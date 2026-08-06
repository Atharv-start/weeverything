/**
 * engine.types.ts
 * Shared type definitions for the WeEverything AI Engine.
 * All provider adapters and consumers use these types — never import from a specific provider.
 */

export type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'openrouter' | 'ollama';

export type AiFeature =
  | 'copilot'
  | 'rag'
  | 'search'
  | 'content-gen'
  | 'doc-ai'
  | 'summarization'
  | 'analytics'
  | 'anomaly'
  | 'nl-query'
  | 'voice'
  | 'personalization'
  | 'automation'
  | 'image-ai';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiGenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
  stream?: boolean;
  feature?: AiFeature;
  userId?: string;
  /** If true, skip cache for this request */
  bypassCache?: boolean;
}

export interface AiGenerateRequest {
  messages: AiMessage[];
  options?: AiGenerateOptions;
}

export interface AiGenerateResponse {
  content: string;
  provider: AiProvider;
  model: string;
  promptTokens: number;
  outputTokens: number;
  latencyMs: number;
  cached: boolean;
}

export interface AiEmbedRequest {
  texts: string[];
  model?: string;
}

export interface AiEmbedResponse {
  embeddings: number[][];
  model: string;
  provider: AiProvider;
}

export interface AiStreamChunk {
  delta: string;
  done: boolean;
}

/** Common interface every provider adapter must implement */
export interface IAiProvider {
  readonly providerName: AiProvider;
  readonly defaultModel: string;
  readonly defaultEmbeddingModel: string;

  isAvailable(): boolean;
  generate(request: AiGenerateRequest): Promise<AiGenerateResponse>;
  generateStream(request: AiGenerateRequest): AsyncIterable<AiStreamChunk>;
  embed(request: AiEmbedRequest): Promise<AiEmbedResponse>;
}
