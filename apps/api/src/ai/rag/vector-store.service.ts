/**
 * vector-store.service.ts
 * Provider-agnostic vector storage and similarity search.
 *
 * Current implementation: SQLite-backed via AiVectorDocument Prisma model.
 * The interface is designed so the backing store can be swapped to
 * pgvector, Pinecone, Weaviate, or Qdrant without changing calling code.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { EmbedderService } from './embedder.service';

export interface VectorDocument {
  id: string;
  userId?: string;
  sourceType: string;
  sourceId?: string;
  chunkIndex: number;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  document: VectorDocument;
  score: number;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly embedder: EmbedderService,
  ) {}

  /**
   * Upsert a document with its embedding into the vector store.
   */
  async upsert(doc: VectorDocument & { content: string }): Promise<string> {
    const embedding = await this.embedder.embed(doc.content);

    const result = await this.prisma.aiVectorDocument.upsert({
      where: {
        id: doc.id,
      },
      create: {
        id: doc.id,
        userId: doc.userId,
        sourceType: doc.sourceType,
        sourceId: doc.sourceId,
        chunkIndex: doc.chunkIndex,
        content: doc.content,
        embedding: JSON.stringify(embedding),
        metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
      },
      update: {
        content: doc.content,
        embedding: JSON.stringify(embedding),
        metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
      },
    });

    return result.id;
  }

  /**
   * Insert multiple document chunks in batch.
   */
  async upsertBatch(
    docs: Array<VectorDocument & { content: string }>,
  ): Promise<void> {
    const contents = docs.map((d) => d.content);
    const embeddings = await this.embedder.embedBatch(contents);

    await Promise.all(
      docs.map((doc, i) =>
        this.prisma.aiVectorDocument.upsert({
          where: { id: doc.id },
          create: {
            id: doc.id,
            userId: doc.userId,
            sourceType: doc.sourceType,
            sourceId: doc.sourceId,
            chunkIndex: doc.chunkIndex,
            content: doc.content,
            embedding: JSON.stringify(embeddings[i] ?? []),
            metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
          },
          update: {
            content: doc.content,
            embedding: JSON.stringify(embeddings[i] ?? []),
            metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
          },
        }),
      ),
    );
  }

  /**
   * Semantic similarity search.
   * SQLite doesn't support native vector ops, so we load candidate rows
   * and compute cosine similarity in-process. For large datasets, swap
   * this method's body with a pgvector / Pinecone / Qdrant query.
   */
  async search(
    query: string,
    options: {
      topK?: number;
      userId?: string;
      sourceType?: string;
      threshold?: number;
    } = {},
  ): Promise<SearchResult[]> {
    const { topK = 5, userId, sourceType, threshold = 0.5 } = options;

    const queryEmbedding = await this.embedder.embed(query);
    if (queryEmbedding.length === 0) return [];

    // Fetch candidate vectors (filtered by user/source for access control)
    const candidates = await this.prisma.aiVectorDocument.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(sourceType ? { sourceType } : {}),
      },
      select: {
        id: true,
        userId: true,
        sourceType: true,
        sourceId: true,
        chunkIndex: true,
        content: true,
        embedding: true,
        metadata: true,
      },
      take: 500, // cap to avoid OOM on large datasets
    });

    // Compute similarities in-process
    const scored: SearchResult[] = [];

    for (const c of candidates) {
      let embedding: number[] = [];
      try {
        embedding = JSON.parse(c.embedding) as number[];
      } catch {
        continue;
      }
      const score = this.embedder.cosineSimilarity(queryEmbedding, embedding);
      if (score < threshold) continue;

      scored.push({
        document: {
          id: c.id,
          userId: c.userId ?? undefined,
          sourceType: c.sourceType,
          sourceId: c.sourceId ?? undefined,
          chunkIndex: c.chunkIndex,
          content: c.content,
          metadata: c.metadata ? (JSON.parse(c.metadata) as Record<string, unknown>) : undefined,
        },
        score,
      });
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Delete all vector chunks for a source document.
   */
  async deleteBySource(sourceType: string, sourceId: string): Promise<void> {
    await this.prisma.aiVectorDocument.deleteMany({
      where: { sourceType, sourceId },
    });
  }

  /**
   * Delete all vectors belonging to a user (GDPR / data deletion).
   */
  async deleteByUser(userId: string): Promise<void> {
    await this.prisma.aiVectorDocument.deleteMany({ where: { userId } });
  }
}
