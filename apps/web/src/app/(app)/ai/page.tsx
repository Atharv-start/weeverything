'use client';

import { useEffect, useState, useCallback } from 'react';
import { aiClient, type AutomationSuggestion, type ExpenseInsights } from '@/lib/ai-client';
import { AISummaryCard } from '@/components/ai/AISummaryCard';
import { AISearchBar } from '@/components/ai/AISearchBar';
import Link from 'next/link';

interface ProviderStatus {
  activeProvider: { provider: string; model: string; available: boolean };
  providers: Array<{ provider: string; available: boolean; defaultModel: string }>;
  promptTemplates: number;
}

interface ProductivityData {
  productivityScore: number;
  trend: string;
  completionRate: number;
  recommendation: string;
  peakDays: string[];
}

export default function AiHubPage() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [suggestions, setSuggestions] = useState<AutomationSuggestion[]>([]);
  const [expenseInsights, setExpenseInsights] = useState<ExpenseInsights | null>(null);
  const [productivity, setProductivity] = useState<ProductivityData | null>(null);
  const [workspaceSummary, setWorkspaceSummary] = useState<{ summary: string; bulletPoints: string[]; actionItems: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Record<string, unknown> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusData, suggestionsData, expenseData, productivityData, workspaceData] = await Promise.allSettled([
        aiClient.getStatus() as Promise<ProviderStatus>,
        aiClient.getSmartSuggestions(),
        aiClient.getExpenseInsights(),
        aiClient.getProductivityInsights() as Promise<ProductivityData>,
        aiClient.summarizeWorkspace(),
      ]);

      if (statusData.status === 'fulfilled') setStatus(statusData.value as ProviderStatus);
      if (suggestionsData.status === 'fulfilled') setSuggestions(suggestionsData.value);
      if (expenseData.status === 'fulfilled') setExpenseInsights(expenseData.value);
      if (productivityData.status === 'fulfilled') setProductivity(productivityData.value as ProductivityData);
      if (workspaceData.status === 'fulfilled') setWorkspaceSummary(workspaceData.value as typeof workspaceSummary);
    } catch {
      // handled per-promise
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    void aiClient.recordFeatureVisit('ai-hub');
  }, [loadData]);

  const priorityColor = (p?: string) => {
    if (p === 'high') return 'text-red-400 bg-red-400/10';
    if (p === 'medium') return 'text-amber-400 bg-amber-400/10';
    return 'text-[var(--color-text-muted)] bg-[var(--color-surface)]';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">AI Hub</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Your intelligent WeEverything assistant</p>
          </div>
        </div>

        {/* Provider status */}
        {status && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
            <span className={`w-2 h-2 rounded-full ${status.activeProvider.available ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-[var(--color-text-muted)]">
              {status.activeProvider.provider} · {status.activeProvider.model}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">·</span>
            <span className="text-xs text-[var(--color-text-muted)]">{status.promptTemplates} prompts</span>
          </div>
        )}
      </div>

      {/* AI Search */}
      <div className="mb-8">
        <AISearchBar
          placeholder="Search across chats, tasks, expenses, moments…"
          scope="all"
          className="w-full"
          onResults={(r) => setSearchResults(r)}
        />
        {searchResults && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Search Results</p>
            <pre className="text-xs text-[var(--color-text)] overflow-auto max-h-40">
              {JSON.stringify(searchResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/ai/copilot"
          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/10 to-purple-500/10 border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[var(--color-primary)] text-2xl">chat</span>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Copilot</p>
            <p className="text-xs text-[var(--color-text-muted)]">Chat with AI</p>
          </div>
        </Link>

        <Link
          href="/ai/insights"
          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/50 transition-colors"
        >
          <span className="material-symbols-outlined text-emerald-400 text-2xl">insights</span>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Insights</p>
            <p className="text-xs text-[var(--color-text-muted)]">Analytics & predictions</p>
          </div>
        </Link>
      </div>

      {/* Smart suggestions */}
      {(loading || suggestions.length > 0) && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Smart Suggestions</h2>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-[var(--color-surface)] animate-pulse" />
              ))
            ) : (
              suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] ${s.actionHref ? 'cursor-pointer hover:border-[var(--color-primary)]/30 transition-colors' : ''}`}
                  onClick={() => s.actionHref && (window.location.href = s.actionHref)}
                >
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor(s.priority)}`}>
                    {s.priority ?? 'info'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{s.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{s.description}</p>
                  </div>
                  {s.actionHref && (
                    <span className="material-symbols-outlined text-[var(--color-text-muted)] text-base">chevron_right</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Workspace Summary */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Workspace Summary</h2>
        <AISummaryCard
          loading={loading}
          summary={workspaceSummary?.summary ?? ''}
          bulletPoints={workspaceSummary?.bulletPoints}
          actionItems={workspaceSummary?.actionItems}
          type="workspace"
          onRefresh={loadData}
        />
      </div>

      {/* Productivity Score */}
      {(loading || productivity) && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Productivity</h2>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 w-20 rounded bg-[var(--color-border)]" />
                <div className="h-3 w-full rounded bg-[var(--color-border)]" />
              </div>
            ) : productivity ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-3xl font-bold text-[var(--color-text)]">{productivity.productivityScore}<span className="text-lg text-[var(--color-text-muted)]">/100</span></p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Productivity Score</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    productivity.trend === 'improving' ? 'bg-green-400/10 text-green-400' :
                    productivity.trend === 'declining' ? 'bg-red-400/10 text-red-400' :
                    'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}>
                    {productivity.trend === 'improving' ? '↑' : productivity.trend === 'declining' ? '↓' : '→'} {productivity.trend}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${productivity.productivityScore}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{productivity.recommendation}</p>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Expense Insights */}
      {(loading || expenseInsights) && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Spending Insights</h2>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-full rounded bg-[var(--color-border)]" />
                <div className="h-3 w-4/5 rounded bg-[var(--color-border)]" />
              </div>
            ) : expenseInsights ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>auto_awesome</span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">AI Financial Coach</span>
                </div>
                <div className="space-y-2 mb-3">
                  {expenseInsights.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0" />
                      <p className="text-sm text-[var(--color-text)]">{insight}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--color-border)] pt-3">
                  <p className="text-xs font-medium text-[var(--color-primary)]">💡 {expenseInsights.tip}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-[var(--color-text-muted)]">Total: {expenseInsights.currency} {expenseInsights.totalSpent.toLocaleString()}</p>
                  <Link href="/ai/insights" className="text-xs text-[var(--color-primary)] hover:underline">View full analysis →</Link>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Capabilities grid */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">AI Capabilities</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: 'search', label: 'Semantic Search', desc: 'Natural language search', href: '/search' },
            { icon: 'summarize', label: 'Summarization', desc: 'Summarize anything', href: '/ai/copilot' },
            { icon: 'description', label: 'Document AI', desc: 'Process documents', href: '/ai/copilot' },
            { icon: 'record_voice_over', label: 'Voice AI', desc: 'Voice commands & notes', href: '/ai/copilot' },
            { icon: 'bar_chart', label: 'Analytics', desc: 'Predictions & trends', href: '/ai/insights' },
            { icon: 'security', label: 'Anomaly Guard', desc: 'Security monitoring', href: '/settings' },
          ].map((cap) => (
            <Link
              key={cap.label}
              href={cap.href}
              className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">{cap.icon}</span>
              <p className="text-xs font-semibold text-[var(--color-text)]">{cap.label}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{cap.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
