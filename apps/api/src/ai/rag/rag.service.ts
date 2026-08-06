/**
 * rag.service.ts
 * Retrieval-Augmented Generation (RAG) orchestrator.
 *
 * Pipeline: Upload → Chunk → Embed → Store → (Query) → Retrieve → LLM → Grounded Answer
 *
 * The service ensures AI never hallucinate when grounded context exists.
 */

import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { AiEngineService } from '../engine/ai-engine.service';
import { AiSafetyService } from '../safety/ai-safety.service';
import { ChunkerService } from './chunker.service';
import { VectorStoreService } from './vector-store.service';

export interface IngestOptions {
  userId?: string;
  sourceType: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface RagQueryOptions {
  userId?: string;
  sourceType?: string;
  topK?: number;
  systemContext?: string;
}

export interface RagResponse {
  answer: string;
  sources: Array<{
    sourceType: string;
    sourceId?: string;
    excerpt: string;
    score: number;
  }>;
  grounded: boolean;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly engine: AiEngineService,
    private readonly safety: AiSafetyService,
    private readonly chunker: ChunkerService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  /**
   * Ingest a document into the RAG pipeline.
   * Chunks the text, embeds each chunk, and stores in the vector store.
   */
  async ingest(content: string, options: IngestOptions): Promise<{ chunksIngested: number }> {
    if (!content || content.trim().length < 10) {
      return { chunksIngested: 0 };
    }

    const chunks = this.chunker.chunk(content, {
      maxChunkSize: 800,
      overlap: 100,
      minChunkSize: 50,
    });

    const docs = chunks.map((chunk) => ({
      id: `${options.sourceType}:${options.sourceId ?? nanoid()}:${chunk.index}`,
      userId: options.userId,
      sourceType: options.sourceType,
      sourceId: options.sourceId,
      chunkIndex: chunk.index,
      content: chunk.content,
      metadata: {
        ...options.metadata,
        startChar: chunk.startChar,
        endChar: chunk.endChar,
      },
    }));

    await this.vectorStore.upsertBatch(docs);
    this.logger.log(`RAG ingest: ${chunks.length} chunks for ${options.sourceType}:${options.sourceId}`);
    return { chunksIngested: chunks.length };
  }

  /**
   * Answer a question using RAG — retrieve relevant context then generate a grounded answer.
   * NEVER hallucinates when application context is available.
   */
  async query(question: string, options: RagQueryOptions = {}): Promise<RagResponse> {
    // Safety check
    const safetyResult = this.safety.checkPrompt(question);
    if (!safetyResult.safe) {
      return {
        answer: 'I cannot process that request.',
        sources: [],
        grounded: false,
      };
    }

    const sanitizedQuestion = this.safety.scrubPii(question);
    const topK = options.topK ?? 5;

    // Retrieve relevant context
    const searchResults = await this.vectorStore.search(sanitizedQuestion, {
      userId: options.userId,
      sourceType: options.sourceType,
      topK,
      threshold: 0.45,
    });

    const hasContext = searchResults.length > 0;

    // Build the context string
    const contextBlock = hasContext
      ? searchResults
          .map((r, i) => `[Source ${i + 1}] (relevance: ${(r.score * 100).toFixed(0)}%)\n${r.document.content}`)
          .join('\n\n---\n\n')
      : '';

    // Build the augmented prompt
    const systemPrompt = options.systemContext ??
      `You are WeEverything's AI assistant. Answer the user's question using ONLY the provided context.
If the context does not contain enough information to answer accurately, say so clearly.
Never invent specific data (dates, amounts, names) not present in the context.
Format your response clearly with markdown when helpful.`;

    const userMessage = hasContext
      ? `Context from WeEverything:\n${contextBlock}\n\n---\n\nQuestion: ${sanitizedQuestion}`
      : `Question: ${sanitizedQuestion}\n\n(Note: No relevant context was found in your WeEverything data. Answering from general knowledge.)`;

    const response = await this.engine.generate(
      [{ role: 'user', content: userMessage }],
      {
        systemPrompt,
        feature: 'rag',
        userId: options.userId,
        maxTokens: 1024,
      },
    );

    return {
      answer: response.content,
      sources: searchResults.map((r) => ({
        sourceType: r.document.sourceType,
        sourceId: r.document.sourceId,
        excerpt: r.document.content.substring(0, 150) + '…',
        score: parseFloat(r.score.toFixed(3)),
      })),
      grounded: hasContext,
    };
  }
}
