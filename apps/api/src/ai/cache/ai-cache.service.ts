/**
 * ai-cache.service.ts
 * Redis-backed semantic response cache for AI requests.
 * Falls back to no-op cache when Redis is unavailable (SQLite-only dev mode).
 *
 * Cache key strategy: SHA-256 hash of (provider + feature + normalized prompt).
 * TTL configurable via AI_CACHE_TTL_SECONDS (default 300s = 5min).
 */

import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import type Redis from 'ioredis';

@Injectable()
export class AiCacheService {
  private readonly logger = new Logger(AiCacheService.name);
  private readonly ttl: number;
  private redis: Redis | null = null;
  /** In-process fallback cache when Redis is not available */
  private readonly memCache = new Map<string, { value: string; expiresAt: number }>();

  constructor() {
    this.ttl = parseInt(process.env.AI_CACHE_TTL_SECONDS ?? '300', 10);
    this.initRedis();
  }

  private initRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.logger.log('REDIS_URL not set — AI cache using in-process memory cache');
      return;
    }

    import('ioredis')
      .then(({ default: Redis }) => {
        this.redis = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        });
        this.redis.on('error', (err) => {
          this.logger.warn(`Redis cache unavailable, falling back to memory: ${err.message}`);
          this.redis = null;
        });
        this.logger.log('AI cache connected to Redis');
      })
      .catch(() => {
        this.logger.warn('ioredis not available — using memory cache');
      });
  }

  /** Build a deterministic cache key from the prompt and context */
  buildKey(feature: string, prompt: string, extra = ''): string {
    const normalized = `${feature}::${prompt.trim().toLowerCase()}::${extra}`;
    return `ai:cache:${createHash('sha256').update(normalized).digest('hex')}`;
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.redis) {
        return await this.redis.get(key);
      }
      // Memory fallback
      const entry = this.memCache.get(key);
      if (entry && entry.expiresAt > Date.now()) {
        return entry.value;
      }
      this.memCache.delete(key);
      return null;
    } catch (err) {
      this.logger.warn(`Cache get failed: ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.ttl;
    try {
      if (this.redis) {
        await this.redis.set(key, value, 'EX', ttl);
        return;
      }
      // Memory fallback
      this.memCache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
      // Prune when cache gets large
      if (this.memCache.size > 1000) this.pruneMemCache();
    } catch (err) {
      this.logger.warn(`Cache set failed: ${(err as Error).message}`);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(`ai:cache:*${pattern}*`);
        if (keys.length > 0) await this.redis.del(...keys);
        return;
      }
      // Memory fallback — can't do pattern matching efficiently, just clear all
      this.memCache.clear();
    } catch (err) {
      this.logger.warn(`Cache invalidate failed: ${(err as Error).message}`);
    }
  }

  private pruneMemCache() {
    const now = Date.now();
    for (const [k, v] of this.memCache) {
      if (v.expiresAt <= now) this.memCache.delete(k);
    }
  }
}
