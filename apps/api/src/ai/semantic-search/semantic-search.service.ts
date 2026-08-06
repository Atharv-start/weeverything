/**
 * semantic-search.service.ts
 * Natural language semantic search across all WeEverything data.
 * Understands intent rather than exact keywords.
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { VectorStoreService } from '../rag/vector-store.service';
import { AiEngineService } from '../engine/ai-engine.service';
import { PromptRegistryService } from '../prompts/prompt-registry.service';
import { AiCacheService } from '../cache/ai-cache.service';

export type SearchScope = 'all' | 'chats' | 'moments' | 'tasks' | 'expenses' | 'notifications' | 'files';

export interface SemanticSearchResult {
  scope: string;
  id: string;
  title: string;
  excerpt: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface SemanticSearchResponse {
  query: string;
  expandedQuery: string;
  results: SemanticSearchResult[];
  total: number;
}

@Injectable()
export class SemanticSearchService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly vectorStore: VectorStoreService,
    private readonly engine: AiEngineService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly cache: AiCacheService,
  ) {}

  async search(
    query: string,
    userId: string,
    scope: SearchScope = 'all',
    topK = 10,
  ): Promise<SemanticSearchResponse> {
    const cacheKey = this.cache.buildKey('semantic-search', `${userId}:${scope}:${query}`, String(topK));
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as SemanticSearchResponse;

    // 1. Expand query semantically using AI
    const expandedQuery = await this.expandQuery(query, scope);

    // 2. Vector similarity search in indexed documents
    const vectorResults = await this.vectorStore.search(expandedQuery, {
      userId,
      sourceType: scope !== 'all' ? this.scopeToSourceType(scope) : undefined,
      topK,
      threshold: 0.4,
    });

    // 3. Combine with keyword results from Prisma for completeness
    const keywordResults = await this.keywordSearch(query, userId, scope, topK);

    // 4. Deduplicate and merge
    const merged = this.mergeResults(vectorResults, keywordResults, topK);

    const response: SemanticSearchResponse = {
      query,
      expandedQuery,
      results: merged,
      total: merged.length,
    };

    await this.cache.set(cacheKey, JSON.stringify(response), 60);
    return response;
  }

  private async expandQuery(query: string, scope: string): Promise<string> {
    try {
      const prompt = this.promptRegistry.render('search.semantic-rewrite.v1', {
        query,
        scope,
      });
      const expanded = await this.engine.ask(prompt, { feature: 'search', maxTokens: 100 });
      return expanded.trim().substring(0, 500);
    } catch {
      return query;
    }
  }

  private async keywordSearch(
    query: string,
    userId: string,
    scope: SearchScope,
    limit: number,
  ): Promise<SemanticSearchResult[]> {
    const results: SemanticSearchResult[] = [];
    const q = query.toLowerCase();

    if (scope === 'all' || scope === 'tasks') {
      const tasks = await this.prisma.task.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
      results.push(...tasks.map((t) => ({
        scope: 'tasks',
        id: t.id,
        title: t.title,
        excerpt: t.description?.substring(0, 120) ?? '',
        score: 0.6,
        metadata: { status: t.status, priority: t.priority },
      })));
    }

    if (scope === 'all' || scope === 'moments') {
      const posts = await this.prisma.post.findMany({
        where: {
          authorId: userId,
          content: { contains: q },
          deletedAt: null,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      results.push(...posts.map((p) => ({
        scope: 'moments',
        id: p.id,
        title: p.content?.substring(0, 60) ?? 'Post',
        excerpt: p.content?.substring(0, 150) ?? '',
        score: 0.55,
      })));
    }

    if (scope === 'all' || scope === 'chats') {
      const messages = await this.prisma.message.findMany({
        where: {
          senderId: userId,
          content: { contains: q },
          deletedAt: null,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { conversation: { select: { name: true } } },
      });
      results.push(...messages.map((m) => ({
        scope: 'chats',
        id: m.id,
        title: m.conversation.name ?? 'Direct Message',
        excerpt: m.content?.substring(0, 150) ?? '',
        score: 0.55,
        metadata: { conversationId: m.conversationId },
      })));
    }

    return results;
  }

  private mergeResults(
    vectorResults: Array<{ document: { sourceType: string; sourceId?: string; content: string }; score: number }>,
    keywordResults: SemanticSearchResult[],
    topK: number,
  ): SemanticSearchResult[] {
    const seen = new Set<string>();
    const merged: SemanticSearchResult[] = [];

    for (const r of vectorResults) {
      const key = `${r.document.sourceType}:${r.document.sourceId ?? r.document.content.substring(0, 20)}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({
          scope: r.document.sourceType,
          id: r.document.sourceId ?? key,
          title: r.document.content.substring(0, 60),
          excerpt: r.document.content.substring(0, 150),
          score: r.score,
        });
      }
    }

    for (const r of keywordResults) {
      const key = `${r.scope}:${r.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(r);
      }
    }

    return merged.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  private scopeToSourceType(scope: SearchScope): string {
    const map: Record<string, string> = {
      chats: 'message',
      moments: 'post',
      tasks: 'task',
      expenses: 'expense',
      notifications: 'notification',
      files: 'document',
    };
    return map[scope] ?? scope;
  }
}
