'use client';

import { CopilotPanel } from '@/components/ai/CopilotPanel';

export default function CopilotPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text)]">AI Copilot</h1>
            <p className="text-xs text-[var(--color-text-muted)]">Context-aware AI assistant</p>
          </div>
        </div>
      </div>

      {/* Full-screen copilot panel */}
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto">
        <CopilotPanel onClose={() => window.history.back()} />
      </div>
    </div>
  );
}
