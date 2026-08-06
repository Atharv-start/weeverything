/**
 * ai-client.ts
 * Type-safe API client for the WeEverything AI Platform.
 * Handles both standard REST requests and SSE streaming.
 */

import { api } from './api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CopilotResponse {
  content: string;
  suggestions?: string[];
  actions?: Array<{ label: string; href: string }>;
  grounded: boolean;
}

export interface SemanticSearchResult {
  scope: string;
  id: string;
  title: string;
  excerpt: string;
  score: number;
}

export interface SummaryResult {
  summary: string;
  bulletPoints: string[];
  actionItems: string[];
  type: string;
}

export interface ExpenseInsights {
  insights: string[];
  tip: string;
  totalSpent: number;
  currency: string;
}

export interface AutomationSuggestion {
  type: string;
  title: string;
  description: string;
  actionHref?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface DocumentAnalysisResult {
  documentType: string;
  title: string | null;
  amount: number | null;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

// ── AI Client ────────────────────────────────────────────────────────────────

export const aiClient = {
  /** Get AI platform status */
  async getStatus() {
    const res = await api.get<{ success: boolean; data: unknown }>('/ai/status');
    return res.data.data;
  },

  // ── Copilot ──────────────────────────────────────────────────────────────

  async copilot(
    message: string,
    options: { currentPage?: string; history?: CopilotMessage[]; useRag?: boolean } = {},
  ): Promise<CopilotResponse> {
    const res = await api.post<{ success: boolean; data: CopilotResponse }>('/ai/copilot', {
      message,
      ...options,
    });
    return res.data.data;
  },

  /** Get SSE stream URL for copilot (use with EventSource) */
  getCopilotStreamUrl(message: string, currentPage?: string): string {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const params = new URLSearchParams({ message });
    if (currentPage) params.set('page', currentPage);
    return `${API_URL}/api/v1/ai/copilot/stream?${params.toString()}`;
  },

  async getChatSuggestions(conversationId: string): Promise<string[]> {
    const res = await api.post<{ success: boolean; data: string[] }>('/ai/chat-suggestions', {
      conversationId,
    });
    return res.data.data;
  },

  // ── Content Generation ────────────────────────────────────────────────────

  async generateContent(request: {
    type: string;
    context?: string;
    instructions?: string;
    tone?: string;
    caption?: string;
    title?: string;
    description?: string;
    topic?: string;
    audience?: string;
    keyPoints?: string;
  }): Promise<string> {
    const res = await api.post<{ success: boolean; data: string }>('/ai/content/generate', request);
    return res.data.data;
  },

  async generateTaskPlan(description: string) {
    const res = await api.post<{
      success: boolean;
      data: Array<{ title: string; description: string; priority: string }>;
    }>('/ai/content/task-plan', { description });
    return res.data.data;
  },

  // ── Document AI ───────────────────────────────────────────────────────────

  async processDocument(
    content: string,
    options: { isOcrText?: boolean; ingestIntoRag?: boolean; sourceId?: string } = {},
  ): Promise<DocumentAnalysisResult> {
    const res = await api.post<{ success: boolean; data: DocumentAnalysisResult }>(
      '/ai/document/process',
      { content, ...options },
    );
    return res.data.data;
  },

  // ── Summarization ─────────────────────────────────────────────────────────

  async summarizeText(content: string, type?: string): Promise<SummaryResult> {
    const res = await api.post<{ success: boolean; data: SummaryResult }>('/ai/summarize', {
      content,
      type,
    });
    return res.data.data;
  },

  async summarizeChat(conversationId: string): Promise<SummaryResult> {
    const res = await api.get<{ success: boolean; data: SummaryResult }>(
      `/ai/summarize/chat/${conversationId}`,
    );
    return res.data.data;
  },

  async summarizeNotifications(): Promise<SummaryResult> {
    const res = await api.get<{ success: boolean; data: SummaryResult }>('/ai/summarize/notifications');
    return res.data.data;
  },

  async summarizeWorkspace(): Promise<SummaryResult> {
    const res = await api.get<{ success: boolean; data: SummaryResult }>('/ai/summarize/workspace');
    return res.data.data;
  },

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getExpenseInsights(): Promise<ExpenseInsights> {
    const res = await api.get<{ success: boolean; data: ExpenseInsights }>('/ai/analytics/expense-insights');
    return res.data.data;
  },

  async getBudgetPrediction() {
    const res = await api.get<{ success: boolean; data: unknown }>('/ai/analytics/budget-prediction');
    return res.data.data;
  },

  async getProductivityInsights() {
    const res = await api.get<{ success: boolean; data: unknown }>('/ai/analytics/productivity');
    return res.data.data;
  },

  async getUsageSummary(days = 30) {
    const res = await api.get<{ success: boolean; data: unknown }>(`/ai/analytics/usage?days=${days}`);
    return res.data.data;
  },

  // ── Automation ────────────────────────────────────────────────────────────

  async getSmartSuggestions(): Promise<AutomationSuggestion[]> {
    const res = await api.get<{ success: boolean; data: AutomationSuggestion[] }>(
      '/ai/automation/suggestions',
    );
    return res.data.data;
  },

  async categorizeExpense(title: string): Promise<string> {
    const res = await api.post<{ success: boolean; data: { category: string } }>(
      '/ai/automation/categorize-expense',
      { title },
    );
    return res.data.data.category;
  },

  async suggestTaskPriority(title: string, description?: string): Promise<string> {
    const res = await api.post<{ success: boolean; data: { priority: string } }>(
      '/ai/automation/suggest-priority',
      { title, description },
    );
    return res.data.data.priority;
  },

  // ── Personalization ───────────────────────────────────────────────────────

  async getPersonalization() {
    const res = await api.get<{ success: boolean; data: unknown }>('/ai/personalization');
    return res.data.data;
  },

  async recordFeatureVisit(feature: string): Promise<void> {
    await api.post('/ai/personalization/feature-visit', { feature }).catch(() => {
      // Non-critical — silently ignore errors
    });
  },

  // ── Semantic Search ───────────────────────────────────────────────────────

  async search(
    query: string,
    scope = 'all',
  ): Promise<{ query: string; expandedQuery: string; results: SemanticSearchResult[]; total: number }> {
    const res = await api.get<{
      success: boolean;
      data: { query: string; expandedQuery: string; results: SemanticSearchResult[]; total: number };
    }>(`/ai/search?q=${encodeURIComponent(query)}&scope=${scope}`);
    return res.data.data;
  },

  // ── Natural Language Query ────────────────────────────────────────────────

  async query(question: string) {
    const res = await api.post<{ success: boolean; data: unknown }>('/ai/query', { question });
    return res.data.data;
  },

  // ── RAG ───────────────────────────────────────────────────────────────────

  async ragIngest(content: string, sourceType: string, sourceId?: string) {
    const res = await api.post<{ success: boolean; data: { chunksIngested: number } }>('/ai/rag/ingest', {
      content,
      sourceType,
      sourceId,
    });
    return res.data.data;
  },

  async ragQuery(question: string, sourceType?: string) {
    const res = await api.post<{ success: boolean; data: unknown }>('/ai/rag/query', {
      question,
      sourceType,
    });
    return res.data.data;
  },

  // ── Voice AI ─────────────────────────────────────────────────────────────

  async parseVoiceCommand(transcript: string) {
    const res = await api.post<{ success: boolean; data: unknown }>('/ai/voice/command', { transcript });
    return res.data.data;
  },

  async cleanTranscript(transcript: string) {
    const res = await api.post<{ success: boolean; data: { transcript: string } }>(
      '/ai/voice/transcribe',
      { transcript },
    );
    return res.data.data.transcript;
  },
};

// ── SSE Streaming Helper ─────────────────────────────────────────────────────

/**
 * Stream copilot response via SSE.
 * Calls onChunk for each text delta, onDone when finished.
 */
export function streamCopilot(
  message: string,
  currentPage: string,
  onChunk: (delta: string) => void,
  onDone: () => void,
  onError?: (err: Event) => void,
): () => void {
  const url = aiClient.getCopilotStreamUrl(message, currentPage);
  const es = new EventSource(url, { withCredentials: true });

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data as string) as { delta: string; done: boolean; error?: string };
      if (data.error) {
        onError?.(new MessageEvent('error', { data: event.data }));
        es.close();
        return;
      }
      if (data.done) {
        onDone();
        es.close();
      } else {
        onChunk(data.delta);
      }
    } catch {
      // ignore parse errors
    }
  };

  es.onerror = (err) => {
    onError?.(err);
    es.close();
    onDone();
  };

  // Return cleanup function
  return () => es.close();
}
