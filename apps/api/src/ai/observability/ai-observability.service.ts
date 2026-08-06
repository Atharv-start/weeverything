/**
 * ai-observability.service.ts
 * Logs every AI request for latency tracking, cost estimation, provider health
 * monitoring, and usage analytics — without logging sensitive user prompts.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import type { AiFeature, AiProvider, AiGenerateResponse } from '../engine/engine.types';

export interface ObservabilityRecord {
  userId?: string;
  provider: AiProvider;
  model: string;
  feature: AiFeature;
  promptTokens: number;
  outputTokens: number;
  latencyMs: number;
  cached: boolean;
  success: boolean;
  errorCode?: string;
}

/** Approximate cost per 1M tokens in USD (ballpark — update as pricing changes) */
const COST_PER_MILLION_INPUT: Record<string, number> = {
  'gemini-1.5-flash': 0.075,
  'gemini-1.5-pro': 1.25,
  'gpt-4o-mini': 0.15,
  'gpt-4o': 2.5,
  'claude-3-5-haiku-20241022': 0.8,
};
const COST_PER_MILLION_OUTPUT: Record<string, number> = {
  'gemini-1.5-flash': 0.3,
  'gemini-1.5-pro': 5.0,
  'gpt-4o-mini': 0.6,
  'gpt-4o': 10.0,
  'claude-3-5-haiku-20241022': 4.0,
};

@Injectable()
export class AiObservabilityService {
  private readonly logger = new Logger(AiObservabilityService.name);

  constructor(private readonly prisma: PrismaClient) {}

  /** Log an AI request result — fire and forget, never blocks the response path */
  log(record: ObservabilityRecord): void {
    const estimatedCost = this.estimateCost(record.model, record.promptTokens, record.outputTokens);

    this.prisma.aiRequestLog
      .create({
        data: {
          userId: record.userId,
          provider: record.provider,
          model: record.model,
          feature: record.feature,
          promptTokens: record.promptTokens,
          outputTokens: record.outputTokens,
          latencyMs: record.latencyMs,
          cached: record.cached,
          success: record.success,
          errorCode: record.errorCode,
          estimatedCost,
        },
      })
      .catch((err) => this.logger.error('Failed to write AI request log', err));
  }

  /** Log a successful AI generation response */
  logSuccess(
    response: AiGenerateResponse,
    feature: AiFeature,
    userId?: string,
  ): void {
    this.log({
      userId,
      provider: response.provider,
      model: response.model,
      feature,
      promptTokens: response.promptTokens,
      outputTokens: response.outputTokens,
      latencyMs: response.latencyMs,
      cached: response.cached,
      success: true,
    });
  }

  /** Log a failed AI request */
  logError(
    provider: AiProvider,
    model: string,
    feature: AiFeature,
    errorCode: string,
    latencyMs: number,
    userId?: string,
  ): void {
    this.log({
      userId,
      provider,
      model,
      feature,
      promptTokens: 0,
      outputTokens: 0,
      latencyMs,
      cached: false,
      success: false,
      errorCode,
    });
  }

  /** Get usage summary for a user */
  async getUserUsageSummary(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.aiRequestLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: {
        feature: true,
        promptTokens: true,
        outputTokens: true,
        estimatedCost: true,
        latencyMs: true,
        success: true,
        cached: true,
      },
    });

    const totalTokens = logs.reduce((s, l) => s + l.promptTokens + l.outputTokens, 0);
    const totalCost = logs.reduce((s, l) => s + l.estimatedCost, 0);
    const avgLatency = logs.length > 0
      ? logs.reduce((s, l) => s + l.latencyMs, 0) / logs.length
      : 0;
    const successRate = logs.length > 0
      ? (logs.filter((l) => l.success).length / logs.length) * 100
      : 100;
    const cacheHitRate = logs.length > 0
      ? (logs.filter((l) => l.cached).length / logs.length) * 100
      : 0;

    const byFeature = logs.reduce<Record<string, number>>((acc, l) => {
      acc[l.feature] = (acc[l.feature] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalRequests: logs.length,
      totalTokens,
      totalCostUsd: parseFloat(totalCost.toFixed(6)),
      avgLatencyMs: Math.round(avgLatency),
      successRate: parseFloat(successRate.toFixed(1)),
      cacheHitRate: parseFloat(cacheHitRate.toFixed(1)),
      byFeature,
      period: `${days}d`,
    };
  }

  /** Get platform-wide health metrics (admin only) */
  async getPlatformHealth() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const logs = await this.prisma.aiRequestLog.findMany({
      where: { createdAt: { gte: last24h } },
      select: {
        provider: true,
        success: true,
        latencyMs: true,
        estimatedCost: true,
        cached: true,
      },
    });

    const byProvider = logs.reduce<
      Record<string, { requests: number; errors: number; totalLatency: number; cost: number }>
    >((acc, l) => {
      if (!acc[l.provider]) {
        acc[l.provider] = { requests: 0, errors: 0, totalLatency: 0, cost: 0 };
      }
      acc[l.provider].requests++;
      if (!l.success) acc[l.provider].errors++;
      acc[l.provider].totalLatency += l.latencyMs;
      acc[l.provider].cost += l.estimatedCost;
      return acc;
    }, {});

    return {
      last24h: {
        totalRequests: logs.length,
        successRate: logs.length > 0
          ? parseFloat(((logs.filter((l) => l.success).length / logs.length) * 100).toFixed(1))
          : 100,
        cacheHitRate: logs.length > 0
          ? parseFloat(((logs.filter((l) => l.cached).length / logs.length) * 100).toFixed(1))
          : 0,
        totalCostUsd: parseFloat(logs.reduce((s, l) => s + l.estimatedCost, 0).toFixed(4)),
      },
      byProvider: Object.entries(byProvider).map(([provider, stats]) => ({
        provider,
        requests: stats.requests,
        errorRate: parseFloat(((stats.errors / stats.requests) * 100).toFixed(1)),
        avgLatencyMs: Math.round(stats.totalLatency / stats.requests),
        totalCostUsd: parseFloat(stats.cost.toFixed(4)),
      })),
    };
  }

  private estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const inputRate = COST_PER_MILLION_INPUT[model] ?? 0.1;
    const outputRate = COST_PER_MILLION_OUTPUT[model] ?? 0.3;
    return (inputTokens * inputRate + outputTokens * outputRate) / 1_000_000;
  }
}
