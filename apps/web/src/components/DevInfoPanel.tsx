'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/Badge';
import clsx from 'clsx';

export function DevInfoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = Boolean(user || accessToken);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Attempt a real health check ping when panel is opened
  const checkApiHealth = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/health`, {
        signal: AbortSignal.timeout(3000),
      });
      setApiStatus(res.ok ? 'online' : 'offline');
    } catch {
      setApiStatus('offline');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 font-mono text-xs">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); checkApiHealth(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-full glass-card border border-[var(--color-primary-glow)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer glow-neon"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold tracking-tight">DEV PANEL</span>
          <span className="material-symbols-outlined text-sm">terminal</span>
        </button>
      )}

      {/* Expanded Modal / Drawer */}
      {isOpen && (
        <div className="w-80 glass-card rounded-2xl border border-[var(--color-primary-glow)] p-4 shadow-2xl space-y-3 bg-[var(--color-surface)]/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[var(--color-primary)]">developer_board</span>
              <span className="font-bold text-sm text-[var(--color-text)]">Dev Observability</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-muted)]">Environment</span>
              <Badge variant="neon">development</Badge>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-muted)]">Backend URL</span>
              <span className="font-mono text-[var(--color-text)]">
                {process.env.NEXT_PUBLIC_API_URL ?? 'localhost:4000'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-muted)]">API Health</span>
              <span className={clsx('font-bold flex items-center gap-1', {
                'text-emerald-400': apiStatus === 'online',
                'text-rose-400': apiStatus === 'offline',
                'text-[var(--color-text-muted)]': apiStatus === 'unknown',
              })}>
                {apiStatus === 'unknown' && 'Not checked'}
                {apiStatus === 'online' && 'ONLINE'}
                {apiStatus === 'offline' && 'OFFLINE'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[var(--color-text-muted)]">Auth State</span>
              <span className={clsx('font-bold', isAuthenticated ? 'text-emerald-400' : 'text-amber-400')}>
                {isAuthenticated ? `USER (${user?.username || 'signed_in'})` : 'GUEST SESSION'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[9px] text-[var(--color-text-muted)]">
            <span>Next.js 15 App Router</span>
            <button
              onClick={checkApiHealth}
              className="text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              Refresh health
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
