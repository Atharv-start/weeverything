/**
 * embedder.service.ts
 * Generates vector embeddings for text using the active AI provider.
 * Caches embeddings to avoid redundant API calls.
 */

import { Injectable, Logger } from '@nestjs/common';
import { AiEngineService } from '../engine/ai-engine.service';
import { AiCacheService } from '../cache/ai-cache.service';

@Injectable()
export class EmbedderService {
  private readonly logger = new Logger(EmbedderService.name);

  constructor(
    private readonly engine: AiEngineService,
    private readonly cache: AiCacheService,
  ) {}

  /**
   * Generate an embedding for a single text.
   * Uses cache to avoid duplicate embedding API calls.
   */
  async embed(text: string): Promise<number[]> {
    const key = this.cache.buildKey('embed', text);
    const cached = await this.cache.get(key);
    if (cached) {
      return JSON.parse(cached) as number[];
    }

    const response = await this.engine.embed([text]);
    const embedding = response.embeddings[0] ?? [];

    if (embedding.length > 0) {
      await this.cache.set(key, JSON.stringify(embedding), 3600); // cache 1 hour
    }

    return embedding;
  }

  /**
   * Generate embeddings for multiple texts in batch.
   * Processes in batches of 20 to respect API limits.
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const BATCH_SIZE = 20;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      // Check cache for each
      const uncachedIndices: number[] = [];
      const cached: Array<number[] | null> = await Promise.all(
        batch.map(async (text, idx) => {
          const key = this.cache.buildKey('embed', text);
          const hit = await this.cache.get(key);
          if (hit) return JSON.parse(hit) as number[];
          uncachedIndices.push(idx);
          return null;
        }),
      );

      // Fetch uncached
      if (uncachedIndices.length > 0) {
        const uncachedTexts = uncachedIndices.map((idx) => batch[idx]);
        const response = await this.engine.embed(uncachedTexts);

        for (let j = 0; j < uncachedIndices.length; j++) {
          const idx = uncachedIndices[j];
          const embedding = response.embeddings[j] ?? [];
          cached[idx] = embedding;

          const key = this.cache.buildKey('embed', batch[idx]);
          if (embedding.length > 0) {
            await this.cache.set(key, JSON.stringify(embedding), 3600);
          }
        }
      }

      results.push(...(cached as number[][]));
    }

    return results;
  }

  /**
   * Compute cosine similarity between two embedding vectors.
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}
