/**
 * copilot.service.ts
 * Universal AI Copilot — context-aware, available everywhere in WeEverything.
 * Handles chat, navigation help, summarization, task automation, and recommendations.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { AiEngineService } from '../engine/ai-engine.service';
import { PromptRegistryService } from '../prompts/prompt-registry.service';
import { AiSafetyService } from '../safety/ai-safety.service';
import { AiObservabilityService } from '../observability/ai-observability.service';
import { AiCacheService } from '../cache/ai-cache.service';
import { RagService } from '../rag/rag.service';

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CopilotRequest {
  message: string;
  currentPage?: string;
  history?: CopilotMessage[];
  useRag?: boolean;
}

export interface CopilotResponse {
  content: string;
  suggestions?: string[];
  actions?: Array<{ label: string; href: string }>;
  grounded: boolean;
}

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly engine: AiEngineService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly safety: AiSafetyService,
    private readonly observability: AiObservabilityService,
    private readonly cache: AiCacheService,
    private readonly rag: RagService,
  ) {}

  /**
   * Handle a copilot message — returns a structured response.
   * For streaming responses, use streamResponse() instead.
   */
  async respond(userId: string, request: CopilotRequest): Promise<CopilotResponse> {
    const safetyCheck = this.safety.checkPrompt(request.message);
    if (!safetyCheck.safe) {
      return {
        content: 'I cannot process that request. Please rephrase.',
        grounded: false,
      };
    }

    const sanitizedMessage = this.safety.scrubPii(request.message);

    // Try RAG first if enabled
    if (request.useRag !== false) {
      const ragResponse = await this.rag.query(sanitizedMessage, {
        userId,
        topK: 3,
      });
      if (ragResponse.grounded && ragResponse.sources.length > 0) {
        return {
          content: ragResponse.answer,
          sources: ragResponse.sources,
          grounded: true,
          actions: this.inferActions(request.currentPage),
        } as CopilotResponse;
      }
    }

    // Build context from current page
    const userContext = await this.buildUserContext(userId, request.currentPage);
    const systemPrompt = this.promptRegistry.render('copilot.system.v1', {
      currentPage: request.currentPage ?? 'unknown',
      userName: userContext.displayName,
      context: userContext.summary,
    });

    const history = (request.history ?? []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const started = Date.now();
    const response = await this.engine.generate(
      [...history, { role: 'user', content: sanitizedMessage }],
      {
        systemPrompt,
        feature: 'copilot',
        userId,
        maxTokens: 512,
        temperature: 0.7,
      },
    );

    this.observability.logSuccess(response, 'copilot', userId);

    const suggestions = this.generateSuggestions(request.currentPage);

    return {
      content: response.content,
      suggestions,
      actions: this.inferActions(request.currentPage),
      grounded: false,
    };
  }

  /**
   * Stream a copilot response — yields text chunks for SSE.
   */
  async *streamResponse(userId: string, request: CopilotRequest): AsyncIterable<string> {
    const safetyCheck = this.safety.checkPrompt(request.message);
    if (!safetyCheck.safe) {
      yield 'I cannot process that request. Please rephrase.';
      return;
    }

    const sanitizedMessage = this.safety.scrubPii(request.message);
    const userContext = await this.buildUserContext(userId, request.currentPage);
    const systemPrompt = this.promptRegistry.render('copilot.system.v1', {
      currentPage: request.currentPage ?? 'unknown',
      userName: userContext.displayName,
      context: userContext.summary,
    });

    const history = (request.history ?? []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    for await (const chunk of this.engine.stream(
      [...history, { role: 'user', content: sanitizedMessage }],
      {
        systemPrompt,
        feature: 'copilot',
        userId,
        maxTokens: 512,
      },
    )) {
      if (!chunk.done && chunk.delta) {
        yield chunk.delta;
      }
    }
  }

  /** Get smart reply suggestions for a chat conversation */
  async getChatSuggestions(conversationId: string, userId: string): Promise<string[]> {
    const cacheKey = this.cache.buildKey('chat-suggestions', conversationId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as string[];

    const messages = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { sender: { select: { displayName: true } } },
    });

    const context = messages
      .reverse()
      .map((m) => `${m.sender.displayName}: ${m.content}`)
      .join('\n');

    const prompt = this.promptRegistry.render('chat.suggestions.v1', { context });
    const fallback = '["Okay, got it!", "Let me check.", "Sounds good!"]';

    try {
      const response = await this.engine.ask(prompt, {
        feature: 'copilot',
        userId,
        maxTokens: 100,
        temperature: 0.8,
      });
      const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const suggestions = JSON.parse(cleaned) as string[];
      await this.cache.set(cacheKey, JSON.stringify(suggestions), 120);
      return suggestions;
    } catch {
      return JSON.parse(fallback) as string[];
    }
  }

  private async buildUserContext(userId: string, currentPage?: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          displayName: true,
          tasks: { where: { status: 'TODO' }, take: 3, select: { title: true } },
        },
      });

      const pendingTasks = user?.tasks.map((t) => t.title).join(', ') ?? 'none';
      return {
        displayName: user?.displayName ?? 'User',
        summary: `Pending tasks: ${pendingTasks}. Current page: ${currentPage ?? 'home'}.`,
      };
    } catch {
      return { displayName: 'User', summary: '' };
    }
  }

  private generateSuggestions(currentPage?: string): string[] {
    const suggestions: Record<string, string[]> = {
      '/home': ['What are my pending tasks?', 'Summarize my recent activity', 'Show my spending this month'],
      '/chats': ['Summarize this conversation', 'Suggest a reply', 'Find messages about...'],
      '/wallet': ['How much did I spend this month?', 'Show my recent transactions', 'Predict my budget'],
      '/workspace': ['What tasks are overdue?', 'Summarize channel activity', 'Who messaged me recently?'],
      '/moments': ['Write a caption for my post', 'Summarize my feed', 'Find posts about...'],
    };
    return suggestions[currentPage ?? ''] ?? [
      'What can I help you with?',
      'Explain a feature',
      'Search my data',
    ];
  }

  private inferActions(currentPage?: string): Array<{ label: string; href: string }> {
    const actions: Record<string, Array<{ label: string; href: string }>> = {
      '/wallet': [{ label: 'View Wallet', href: '/wallet' }],
      '/workspace': [{ label: 'View Tasks', href: '/workspace' }],
      '/chats': [{ label: 'Open Chats', href: '/chats' }],
    };
    return actions[currentPage ?? ''] ?? [];
  }
}
