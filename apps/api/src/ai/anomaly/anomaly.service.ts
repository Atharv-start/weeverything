/**
 * anomaly.service.ts
 * Detects unusual behavior — suspicious logins, wallet anomalies, spam, and fraud.
 * Flags anomalies without blocking legitimate users unnecessarily.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { AiEngineService } from '../engine/ai-engine.service';
import { PromptRegistryService } from '../prompts/prompt-registry.service';

export type AnomalyType = 'SUSPICIOUS_LOGIN' | 'WALLET_ANOMALY' | 'SPAM' | 'FRAUD' | 'ABNORMAL_USAGE';
export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AnomalyReport {
  detected: boolean;
  type?: AnomalyType;
  severity?: AnomalySeverity;
  description: string;
  recommendation: string;
  anomalyId?: string;
}

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly engine: AiEngineService,
    private readonly promptRegistry: PromptRegistryService,
  ) {}

  /**
   * Analyze a login event for suspicious activity.
   * Call this on every login from the auth service.
   */
  async analyzeLogin(
    userId: string,
    loginData: {
      ipAddress?: string;
      userAgent?: string;
      location?: string;
    },
  ): Promise<AnomalyReport> {
    // Fetch recent sessions for comparison
    const recentSessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { ipAddress: true, userAgent: true, createdAt: true },
    });

    // Simple heuristic checks (fast, no LLM required for basic detection)
    const uniqueIps = new Set(recentSessions.map((s) => s.ipAddress).filter(Boolean));
    const isNewIp = loginData.ipAddress && !uniqueIps.has(loginData.ipAddress);
    const loginVelocity = recentSessions.filter(
      (s) => Date.now() - s.createdAt.getTime() < 5 * 60 * 1000, // 5 minutes
    ).length;

    if (loginVelocity >= 5) {
      const anomaly = await this.recordAnomaly(userId, 'SUSPICIOUS_LOGIN', 'HIGH',
        `Rapid login attempts detected: ${loginVelocity} logins in the last 5 minutes.`,
        JSON.stringify(loginData),
      );
      return {
        detected: true,
        type: 'SUSPICIOUS_LOGIN',
        severity: 'HIGH',
        description: 'Multiple rapid login attempts detected from your account.',
        recommendation: 'Review your recent account activity and change your password if you did not initiate these logins.',
        anomalyId: anomaly.id,
      };
    }

    if (isNewIp && recentSessions.length >= 3) {
      const anomaly = await this.recordAnomaly(userId, 'SUSPICIOUS_LOGIN', 'LOW',
        `Login from new IP address: ${loginData.ipAddress}`,
        JSON.stringify(loginData),
      );
      return {
        detected: true,
        type: 'SUSPICIOUS_LOGIN',
        severity: 'LOW',
        description: 'Login detected from a new location or device.',
        recommendation: 'If this was you, no action is needed. Otherwise, secure your account.',
        anomalyId: anomaly.id,
      };
    }

    return { detected: false, description: 'No anomalies detected.', recommendation: '' };
  }

  /**
   * Analyze a wallet transaction for fraud indicators.
   */
  async analyzeWalletTransaction(
    userId: string,
    transaction: {
      amount: number;
      currency: string;
      type: 'CREDIT' | 'DEBIT';
      description?: string;
    },
  ): Promise<AnomalyReport> {
    // Fetch recent transactions for baseline
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { amount: true, type: true, createdAt: true },
        },
      },
    });

    if (!wallet) return { detected: false, description: 'No wallet found.', recommendation: '' };

    const avgAmount = wallet.ledgerEntries.length > 0
      ? wallet.ledgerEntries.reduce((s, e) => s + e.amount, 0) / wallet.ledgerEntries.length
      : 0;

    // Flag transactions significantly above average (10x or > ₹50,000)
    const isLargeTransaction = transaction.amount > avgAmount * 10 || transaction.amount > 5000000; // 5M paise = ₹50k

    if (isLargeTransaction) {
      const anomaly = await this.recordAnomaly(userId, 'WALLET_ANOMALY', 'MEDIUM',
        `Large transaction: ₹${(transaction.amount / 100).toFixed(2)} (avg: ₹${(avgAmount / 100).toFixed(2)})`,
        JSON.stringify(transaction),
      );
      return {
        detected: true,
        type: 'WALLET_ANOMALY',
        severity: 'MEDIUM',
        description: `A transaction of ₹${(transaction.amount / 100).toFixed(2)} is significantly above your average.`,
        recommendation: 'Verify this transaction was intentional.',
        anomalyId: anomaly.id,
      };
    }

    return { detected: false, description: 'Transaction looks normal.', recommendation: '' };
  }

  /**
   * Check if a message or post content appears to be spam.
   */
  async detectSpam(content: string, userId?: string): Promise<{ isSpam: boolean; confidence: number }> {
    // Fast pattern checks first
    const spamPatterns = [
      /click here to win/i,
      /you have been selected/i,
      /free money/i,
      /buy now.*discount/i,
      /(https?:\/\/[^\s]+){3,}/,  // 3+ URLs
    ];

    const patternMatch = spamPatterns.some((p) => p.test(content));
    if (patternMatch) return { isSpam: true, confidence: 90 };

    // For borderline cases, use AI
    if (content.length > 50) {
      try {
        const prompt = `Is the following message spam? Reply with JSON: {"isSpam": boolean, "confidence": 0-100}\n\nMessage: ${content.substring(0, 500)}`;
        const response = await this.engine.ask(prompt, { feature: 'anomaly', userId, maxTokens: 50 });
        const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned) as { isSpam: boolean; confidence: number };
      } catch {
        return { isSpam: false, confidence: 50 };
      }
    }

    return { isSpam: false, confidence: 95 };
  }

  /** Get all unresolved anomalies for a user */
  async getUserAnomalies(userId: string): Promise<
    Array<{ id: string; type: string; severity: string; description: string; createdAt: Date }>
  > {
    return this.prisma.aiAnomaly.findMany({
      where: { userId, isResolved: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, type: true, severity: true, description: true, createdAt: true },
    });
  }

  /** Mark an anomaly as resolved */
  async resolveAnomaly(anomalyId: string): Promise<void> {
    await this.prisma.aiAnomaly.update({
      where: { id: anomalyId },
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }

  private async recordAnomaly(
    userId: string,
    type: AnomalyType,
    severity: AnomalySeverity,
    description: string,
    metadata?: string,
  ) {
    const anomaly = await this.prisma.aiAnomaly.create({
      data: { userId, type, severity, description, metadata },
    });
    this.logger.warn(`Anomaly detected [${severity}]: ${type} for user ${userId}`);
    return anomaly;
  }
}
