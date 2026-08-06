/**
 * analytics.service.ts
 * Predictive analytics — budget forecasts, productivity trends, task predictions,
 * and engagement insights. Clearly distinguishes predictions from historical facts.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { AiEngineService } from '../engine/ai-engine.service';
import { PromptRegistryService } from '../prompts/prompt-registry.service';
import { AiCacheService } from '../cache/ai-cache.service';

export interface ExpenseInsights {
  insights: string[];
  tip: string;
  totalSpent: number;
  currency: string;
  period: string;
}

export interface BudgetPrediction {
  predictedTotal: number;
  currency: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  breakdown: Array<{ category: string; amount: number }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  insight: string;
  isPrediction: true;
}

export interface ProductivityInsights {
  productivityScore: number;
  trend: 'improving' | 'declining' | 'stable';
  peakDays: string[];
  bottlenecks: string[];
  recommendation: string;
  completionRate: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly engine: AiEngineService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly cache: AiCacheService,
  ) {}

  async getExpenseInsights(userId: string): Promise<ExpenseInsights> {
    const cacheKey = this.cache.buildKey('expense-insights', userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as ExpenseInsights;

    const expenses = await this.prisma.expense.findMany({
      where: { paidById: userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    if (expenses.length === 0) {
      return {
        insights: ['No spending data available. Record some expenses to get personalized insights.'],
        tip: 'Start tracking your expenses in the Expense Splitter Mini App.',
        totalSpent: 0,
        currency: 'INR',
        period: 'last 20 transactions',
      };
    }

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const summary = expenses.map((e) => `- ${e.title}: ₹${(e.amount / 100).toFixed(2)}`).join('\n');

    const prompt = this.promptRegistry.render('analytics.expense-insights.v1', {
      expenses: summary,
      total: `₹${(totalSpent / 100).toFixed(2)}`,
      currency: 'INR',
      period: 'last 20 transactions',
    });

    try {
      const response = await this.engine.ask(prompt, { feature: 'analytics', userId, maxTokens: 300 });
      const lines = response.split('\n').filter((l) => l.trim().startsWith('•') || l.trim().startsWith('-'));
      const insights = lines.slice(0, 2).map((l) => l.replace(/^[•\-]\s*/, '').trim());
      const tipLine = lines.find((l) => l.toLowerCase().includes('tip'));
      const result: ExpenseInsights = {
        insights: insights.length > 0 ? insights : [response.substring(0, 200)],
        tip: tipLine?.replace(/^[•\-]\s*(tip:\s*)?/i, '').trim() ?? 'Track your spending regularly for better insights.',
        totalSpent: totalSpent / 100,
        currency: 'INR',
        period: 'last 20 transactions',
      };
      await this.cache.set(cacheKey, JSON.stringify(result), 300);
      return result;
    } catch {
      return {
        insights: ['You have recent spending activity. Keep tracking for personalized insights.'],
        tip: 'Set monthly budget limits to better manage your expenses.',
        totalSpent: totalSpent / 100,
        currency: 'INR',
        period: 'last 20 transactions',
      };
    }
  }

  async predictBudget(userId: string): Promise<BudgetPrediction> {
    const cacheKey = this.cache.buildKey('budget-prediction', userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as BudgetPrediction;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await this.prisma.expense.findMany({
      where: { paidById: userId, createdAt: { gte: threeMonthsAgo } },
      orderBy: { createdAt: 'desc' },
    });

    if (expenses.length < 3) {
      return {
        predictedTotal: 0,
        currency: 'INR',
        confidence: 'LOW',
        breakdown: [],
        trend: 'stable',
        insight: 'Not enough data for a reliable prediction. Keep tracking expenses!',
        isPrediction: true,
      };
    }

    const monthlyTotals = expenses.reduce<Record<string, number>>((acc, e) => {
      const month = e.createdAt.toISOString().substring(0, 7);
      acc[month] = (acc[month] ?? 0) + e.amount / 100;
      return acc;
    }, {});

    const prompt = this.promptRegistry.render('analytics.budget-prediction.v1', {
      history: JSON.stringify(monthlyTotals),
    });

    try {
      const response = await this.engine.ask(prompt, { feature: 'analytics', userId, maxTokens: 256 });
      const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned) as BudgetPrediction;
      const result = { ...parsed, isPrediction: true as const };
      await this.cache.set(cacheKey, JSON.stringify(result), 3600);
      return result;
    } catch {
      const avg = Object.values(monthlyTotals).reduce((s, v) => s + v, 0) / Object.keys(monthlyTotals).length;
      return {
        predictedTotal: Math.round(avg),
        currency: 'INR',
        confidence: 'LOW',
        breakdown: [],
        trend: 'stable',
        insight: `Based on recent history, predicted monthly spend is ₹${Math.round(avg).toLocaleString()}.`,
        isPrediction: true,
      };
    }
  }

  async getProductivityInsights(userId: string): Promise<ProductivityInsights> {
    const cacheKey = this.cache.buildKey('productivity-insights', userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as ProductivityInsights;

    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (total === 0) {
      return {
        productivityScore: 0,
        trend: 'stable',
        peakDays: [],
        bottlenecks: ['No task data available'],
        recommendation: 'Start creating tasks in the Daily Planner to track your productivity.',
        completionRate: 0,
      };
    }

    const taskData = JSON.stringify({
      total,
      completed,
      completionRate,
      byPriority: tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.priority] = (acc[t.priority] ?? 0) + 1;
        return acc;
      }, {}),
      byStatus: tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1;
        return acc;
      }, {}),
    });

    const prompt = this.promptRegistry.render('analytics.productivity-trends.v1', { taskData });

    try {
      const response = await this.engine.ask(prompt, { feature: 'analytics', userId, maxTokens: 256 });
      const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned) as Omit<ProductivityInsights, 'completionRate'>;
      const result = { ...parsed, completionRate };
      await this.cache.set(cacheKey, JSON.stringify(result), 1800);
      return result;
    } catch {
      return {
        productivityScore: completionRate,
        trend: completionRate >= 70 ? 'improving' : completionRate >= 40 ? 'stable' : 'declining',
        peakDays: [],
        bottlenecks: completionRate < 50 ? ['Low task completion rate'] : [],
        recommendation: completionRate < 50
          ? 'Focus on completing existing tasks before creating new ones.'
          : 'Great job! Keep maintaining your current work pace.',
        completionRate,
      };
    }
  }
}
