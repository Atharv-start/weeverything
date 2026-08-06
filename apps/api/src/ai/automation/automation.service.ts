/**
 * automation.service.ts
 * Intelligent automation — auto-categorization, smart reminders,
 * task suggestions, and context-aware priority recommendations.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { AiEngineService } from '../engine/ai-engine.service';
import { AiCacheService } from '../cache/ai-cache.service';

export interface AutomationSuggestion {
  type: string;
  title: string;
  description: string;
  actionHref?: string;
  priority?: 'low' | 'medium' | 'high';
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly engine: AiEngineService,
    private readonly cache: AiCacheService,
  ) {}

  /**
   * Generate smart suggestions for the user's current context.
   * Used in the home dashboard and copilot.
   */
  async getSmartSuggestions(userId: string): Promise<AutomationSuggestion[]> {
    const cacheKey = this.cache.buildKey('smart-suggestions', userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as AutomationSuggestion[];

    const [tasks, expenses, unreadNotifications] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId, status: { in: ['TODO', 'IN_PROGRESS'] } },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 5,
      }),
      this.prisma.expense.findMany({
        where: { paidById: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.notification.count({
        where: { recipientId: userId, isRead: false },
      }),
    ]);

    const suggestions: AutomationSuggestion[] = [];

    // Task-based suggestions
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED',
    );
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'task-reminder',
        title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        description: `"${overdueTasks[0].title}" is overdue. Review and update your tasks.`,
        actionHref: '/workspace',
        priority: 'high',
      });
    }

    const highPriorityTasks = tasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH');
    if (highPriorityTasks.length > 0 && overdueTasks.length === 0) {
      suggestions.push({
        type: 'task-focus',
        title: `${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? 's' : ''}`,
        description: `Focus on "${highPriorityTasks[0].title}" today.`,
        actionHref: '/workspace',
        priority: 'medium',
      });
    }

    // Notification suggestions
    if (unreadNotifications > 5) {
      suggestions.push({
        type: 'notification-summary',
        title: `${unreadNotifications} unread notifications`,
        description: 'You have pending notifications. Get an AI summary.',
        actionHref: '/notifications',
        priority: 'low',
      });
    }

    // Expense suggestions
    if (expenses.length > 0) {
      const totalThisWeek = expenses
        .filter((e) => Date.now() - e.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000)
        .reduce((s, e) => s + e.amount, 0);
      if (totalThisWeek > 0) {
        suggestions.push({
          type: 'expense-insight',
          title: `₹${(totalThisWeek / 100).toFixed(0)} spent this week`,
          description: 'View your AI-powered spending insights.',
          actionHref: '/wallet',
          priority: 'low',
        });
      }
    }

    // AI-powered additional suggestions (async, best-effort)
    try {
      const contextSummary = `Tasks: ${tasks.length} pending (${overdueTasks.length} overdue). Expenses: ${expenses.length} recent.`;
      const prompt = `Given this user context, suggest one specific, actionable recommendation in 10 words or less: ${contextSummary}`;
      const aiSuggestion = await this.engine.ask(prompt, { feature: 'automation', userId, maxTokens: 50 });
      if (aiSuggestion && aiSuggestion.length < 200) {
        suggestions.push({
          type: 'ai-recommendation',
          title: 'AI Recommendation',
          description: aiSuggestion.trim(),
          priority: 'low',
        });
      }
    } catch {
      // Non-critical — skip if AI is unavailable
    }

    await this.cache.set(cacheKey, JSON.stringify(suggestions), 300);
    return suggestions;
  }

  /**
   * Auto-categorize an expense based on its title.
   */
  async categorizeExpense(title: string): Promise<string> {
    const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Other'];

    try {
      const prompt = `Categorize this expense into one of these categories: ${categories.join(', ')}.
Return ONLY the category name, nothing else.
Expense: "${title}"`;
      const response = await this.engine.ask(prompt, { feature: 'automation', maxTokens: 20 });
      const category = response.trim();
      return categories.includes(category) ? category : 'Other';
    } catch {
      return 'Other';
    }
  }

  /**
   * Suggest a priority for a new task based on its description.
   */
  async suggestTaskPriority(title: string, description?: string): Promise<string> {
    try {
      const prompt = `What priority should this task have? Return ONLY one of: LOW, MEDIUM, HIGH, URGENT.
Task: "${title}"
${description ? `Description: "${description}"` : ''}`;
      const response = await this.engine.ask(prompt, { feature: 'automation', maxTokens: 10 });
      const priority = response.trim().toUpperCase();
      const valid = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      return valid.includes(priority) ? priority : 'MEDIUM';
    } catch {
      return 'MEDIUM';
    }
  }
}
