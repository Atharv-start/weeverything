/**
 * nl-query.service.ts
 * Translates natural language questions into safe structured queries.
 * NEVER executes raw SQL. Translates to safe Prisma queries only.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { AiEngineService } from '../engine/ai-engine.service';
import { PromptRegistryService } from '../prompts/prompt-registry.service';
import { AiSafetyService } from '../safety/ai-safety.service';

export interface NlQueryResult {
  question: string;
  explanation: string;
  data: unknown[];
  entity: string;
  rowCount: number;
}

interface StructuredQuery {
  entity: string;
  filters: Array<{ field: string; op: string; value: string }>;
  sort: { field: string; dir: 'asc' | 'desc' };
  limit: number;
  explanation: string;
}

@Injectable()
export class NlQueryService {
  private readonly logger = new Logger(NlQueryService.name);

  // Only these entities are allowed
  private readonly allowedEntities = new Set([
    'expenses', 'tasks', 'messages', 'posts', 'wallet', 'users',
  ]);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly engine: AiEngineService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly safety: AiSafetyService,
  ) {}

  async query(question: string, userId: string): Promise<NlQueryResult> {
    // Safety check
    const safetyResult = this.safety.checkPrompt(question);
    if (!safetyResult.safe) {
      return {
        question,
        explanation: 'Cannot process this request.',
        data: [],
        entity: 'unknown',
        rowCount: 0,
      };
    }

    const prompt = this.promptRegistry.render('search.nl-query.v1', {
      question: this.safety.scrubPii(question),
      userContext: `User ID: ${userId}`,
    });

    let structured: StructuredQuery;
    try {
      const raw = await this.engine.ask(prompt, { feature: 'nl-query', maxTokens: 256 });
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      structured = JSON.parse(cleaned) as StructuredQuery;
    } catch (err) {
      this.logger.warn('NL query translation failed, returning empty result', err);
      return { question, explanation: 'Could not parse your question.', data: [], entity: 'unknown', rowCount: 0 };
    }

    // Safety: only allow white-listed entities
    if (!this.allowedEntities.has(structured.entity)) {
      return {
        question,
        explanation: `Access to "${structured.entity}" is not permitted via natural language queries.`,
        data: [],
        entity: structured.entity,
        rowCount: 0,
      };
    }

    const data = await this.executeStructuredQuery(structured, userId);

    return {
      question,
      explanation: structured.explanation,
      data,
      entity: structured.entity,
      rowCount: data.length,
    };
  }

  private async executeStructuredQuery(q: StructuredQuery, userId: string): Promise<unknown[]> {
    const limit = Math.min(q.limit ?? 10, 50); // hard cap at 50

    switch (q.entity) {
      case 'expenses': {
        const expenses = await this.prisma.expense.findMany({
          where: { paidById: userId },
          take: limit,
          orderBy: { [q.sort?.field ?? 'createdAt']: q.sort?.dir ?? 'desc' },
          select: { id: true, title: true, amount: true, currency: true, createdAt: true },
        });
        return expenses.map((e) => ({ ...e, amount: e.amount / 100 }));
      }

      case 'tasks': {
        const taskWhere: { userId: string; status?: string; priority?: string } = { userId };
        for (const f of q.filters ?? []) {
          if (f.field === 'status') taskWhere.status = f.value.toUpperCase();
          if (f.field === 'priority') taskWhere.priority = f.value.toUpperCase();
        }
        return this.prisma.task.findMany({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          where: taskWhere as any,
          take: limit,
          orderBy: { [q.sort?.field ?? 'updatedAt']: q.sort?.dir ?? 'desc' },
          select: { id: true, title: true, status: true, priority: true, dueDate: true },
        });
      }

      case 'messages': {
        return this.prisma.message.findMany({
          where: { senderId: userId, deletedAt: null },
          take: limit,
          orderBy: { createdAt: q.sort?.dir ?? 'desc' },
          select: { id: true, content: true, createdAt: true, conversationId: true },
        });
      }

      case 'posts': {
        return this.prisma.post.findMany({
          where: { authorId: userId, deletedAt: null },
          take: limit,
          orderBy: { createdAt: q.sort?.dir ?? 'desc' },
          select: { id: true, content: true, likesCount: true, commentsCount: true, createdAt: true },
        });
      }

      default:
        return [];
    }
  }
}
