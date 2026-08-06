'use client';

import { useEffect, useState, useCallback } from 'react';
import { aiClient } from '@/lib/ai-client';
import Link from 'next/link';

interface BudgetPrediction {
  predictedTotal: number;
  currency: string;
  confidence: string;
  trend: string;
  insight: string;
  isPrediction: boolean;
}

interface ProductivityData {
  productivityScore: number;
  trend: string;
  completionRate: number;
  recommendation: string;
  peakDays: string[];
  bottlenecks: string[];
}

export default function InsightsPage() {
  const [budget, setBudget] = useState<BudgetPrediction | null>(null);
  const [productivity, setProductivity] = useState<ProductivityData | null>(null);
  const [usage, setUsage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [budgetResult, productivityResult, usageResult] = await Promise.allSettled([
      aiClient.getBudgetPrediction(),
      aiClient.getProductivityInsights(),
      aiClient.getUsageSummary(30),
    ]);

    if (budgetResult.status === 'fulfilled') setBudget(budgetResult.value as BudgetPrediction);
    if (productivityResult.status === 'fulfilled') setProductivity(productivityResult.value as ProductivityData);
    if (usageResult.status === 'fulfilled') setUsage(usageResult.value as Record<string, unknown>);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
    void aiClient.recordFeatureVisit('ai-insights');
  }, [loadData]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/ai" className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-muted)]">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">AI Insights</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Analytics & predictions</p>
        </div>
      </div>

      {/* Prediction badge */}
      <div className="mb-6 px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-400 text-base">info</span>
        <p className="text-xs text-amber-400">AI predictions are estimates based on your usage history. They are not financial advice.</p>
      </div>

      {/* Budget prediction */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Budget Prediction</h2>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 w-32 rounded bg-[var(--color-border)]" />
              <div className="h-3 w-full rounded bg-[var(--color-border)]" />
            </div>
          ) : budget ? (
            <>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-[var(--color-text)]">
                  {budget.currency} {budget.predictedTotal.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mb-1">predicted next month</p>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  budget.confidence === 'HIGH' ? 'bg-green-400/10 text-green-400' :
                  budget.confidence === 'MEDIUM' ? 'bg-amber-400/10 text-amber-400' :
                  'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
                  {budget.confidence} confidence
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  budget.trend === 'increasing' ? 'bg-red-400/10 text-red-400' :
                  budget.trend === 'decreasing' ? 'bg-green-400/10 text-green-400' :
                  'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
                  {budget.trend === 'increasing' ? '↑' : budget.trend === 'decreasing' ? '↓' : '→'} {budget.trend}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{budget.insight}</p>
            </>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">Not enough data for budget prediction. Track more expenses!</p>
          )}
        </div>
      </div>

      {/* Productivity */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Productivity Analysis</h2>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-8 w-20 rounded bg-[var(--color-border)]" />
              <div className="h-2 rounded bg-[var(--color-border)]" />
              <div className="h-3 w-3/4 rounded bg-[var(--color-border)]" />
            </div>
          ) : productivity ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-3xl font-bold text-[var(--color-text)]">{productivity.productivityScore}<span className="text-base text-[var(--color-text-muted)]">/100</span></p>
                  <p className="text-xs text-[var(--color-text-muted)]">Score · {productivity.completionRate}% task completion</p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-border)" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="28" fill="none"
                      stroke="var(--color-primary)" strokeWidth="6"
                      strokeDasharray={`${productivity.productivityScore * 1.759} 175.9`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-purple-500 rounded-full"
                  style={{ width: `${productivity.productivityScore}%` }}
                />
              </div>
              {productivity.bottlenecks.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Bottlenecks</p>
                  {productivity.bottlenecks.map((b, i) => (
                    <p key={i} className="text-xs text-red-400">• {b}</p>
                  ))}
                </div>
              )}
              <p className="text-sm text-[var(--color-text-muted)]">💡 {productivity.recommendation}</p>
            </>
          ) : null}
        </div>
      </div>

      {/* AI Usage */}
      {usage && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">AI Usage (30d)</h2>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <pre className="text-xs text-[var(--color-text)] overflow-auto">
              {JSON.stringify(usage, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
