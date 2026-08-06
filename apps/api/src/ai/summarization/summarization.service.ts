/**
 * summarization.service.ts
 * AI summarization for chats, moments, workspace activity, notifications,
 * meetings, search results, and documents.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { AiEngineService } from '../engine/ai-engine.service';
import { PromptRegistryService } from '../prompts/prompt-registry.service';
import { AiCacheService } from '../cache/ai-cache.service';

export interface SummaryResult {
  summary: string;
  bulletPoints: string[];
  actionItems: string[];
  type: string;
}

@Injectable()
export class SummarizationService {
  private readonly logger = new Logger(SummarizationService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly engine: AiEngineService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly cache: AiCacheService,
  ) {}

  /** Summarize a conversation */
  async summarizeConversation(conversationId: string, userId: string): Promise<SummaryResult> {
    const cacheKey = this.cache.buildKey('summarize-chat', conversationId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as SummaryResult;

    const messages = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: { sender: { select: { displayName: true } } },
    });

    if (messages.length === 0) {
      return { summary: 'No messages to summarize.', bulletPoints: [], actionItems: [], type: 'chat' };
    }

    const context = messages
      .map((m) => `${m.sender.displayName}: ${m.content}`)
      .join('\n');

    const participants = [...new Set(messages.map((m) => m.sender.displayName))].join(', ');
    const prompt = this.promptRegistry.render('chat.summarize.v1', { context, participants });

    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'summarization', userId, maxTokens: 512 },
    );

    const result = this.parseMarkdownSummary(response.content, 'chat');
    await this.cache.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  /** Summarize a user's recent notifications */
  async summarizeNotifications(userId: string): Promise<SummaryResult> {
    const cacheKey = this.cache.buildKey('summarize-notifications', userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as SummaryResult;

    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { type: true, title: true, body: true, createdAt: true },
    });

    if (notifications.length === 0) {
      return { summary: 'No unread notifications.', bulletPoints: [], actionItems: [], type: 'notifications' };
    }

    const context = notifications.map((n) => `[${n.type}] ${n.title}: ${n.body ?? ''}`).join('\n');
    const prompt = `Summarize these notifications in a brief paragraph and extract any action items:\n\n${context}`;

    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'summarization', userId, maxTokens: 256 },
    );

    const result = this.parseMarkdownSummary(response.content, 'notifications');
    await this.cache.set(cacheKey, JSON.stringify(result), 120);
    return result;
  }

  /** Summarize a user's workspace activity */
  async summarizeWorkspaceActivity(userId: string): Promise<SummaryResult> {
    const cacheKey = this.cache.buildKey('summarize-workspace', userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as SummaryResult;

    const [tasks, recentMessages] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: { title: true, status: true, priority: true, dueDate: true },
      }),
      this.prisma.message.findMany({
        where: { senderId: userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { conversation: { select: { name: true } } },
      }),
    ]);

    const taskSummary = tasks
      .map((t) => `Task: ${t.title} [${t.status}/${t.priority}]`)
      .join('\n');
    const messageSummary = recentMessages
      .slice(0, 10)
      .map((m) => `Message in "${m.conversation.name ?? 'DM'}": ${m.content?.substring(0, 80) ?? ''}`)
      .join('\n');

    const context = `Tasks:\n${taskSummary}\n\nRecent Messages:\n${messageSummary}`;
    const prompt = `Summarize this user's recent workspace activity. Highlight what they're working on and any urgent items:\n\n${context}`;

    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'summarization', userId, maxTokens: 400 },
    );

    const result = this.parseMarkdownSummary(response.content, 'workspace');
    await this.cache.set(cacheKey, JSON.stringify(result), 180);
    return result;
  }

  /** Summarize arbitrary text content */
  async summarizeText(content: string, type = 'document', userId?: string): Promise<SummaryResult> {
    const truncated = content.substring(0, 6000);
    const prompt = `Summarize the following text concisely with bullet points and any action items:\n\n${truncated}`;

    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'summarization', userId, maxTokens: 512 },
    );

    return this.parseMarkdownSummary(response.content, type);
  }

  private parseMarkdownSummary(content: string, type: string): SummaryResult {
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    const bulletPoints: string[] = [];
    const actionItems: string[] = [];

    for (const line of lines) {
      if (line.match(/^\*\*\[ACTION\]\*\*|^\[ACTION\]/i) || line.toLowerCase().includes('[action]')) {
        actionItems.push(line.replace(/\*\*\[ACTION\]\*\*/gi, '').replace(/\[ACTION\]/gi, '').trim());
      } else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
        bulletPoints.push(line.replace(/^[-•*]\s/, '').trim());
      }
    }

    return {
      summary: content.substring(0, 500),
      bulletPoints: bulletPoints.slice(0, 10),
      actionItems: actionItems.slice(0, 5),
      type,
    };
  }
}
