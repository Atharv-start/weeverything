'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { aiClient } from '@/lib/ai-client';

interface AISearchBarProps {
  placeholder?: string;
  scope?: string;
  className?: string;
  onResults?: (results: Record<string, unknown>) => void;
}

export function AISearchBar({ placeholder = 'Search anything…', scope = 'all', className = '', onResults }: AISearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const results = await aiClient.search(query, scope);
      if (onResults) {
        onResults(results as unknown as Record<string, unknown>);
      } else {
        // Navigate to search page with query
        router.push(`/search?q=${encodeURIComponent(query)}&ai=1`);
      }
    } catch {
      // Silently fall back to standard search
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } finally {
      setIsSearching(false);
    }
  }, [query, scope, isSearching, router, onResults]);

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 focus-within:border-[var(--color-primary)] transition-colors group">
        {/* AI indicator */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-lg">
            {isSearching ? 'autorenew' : 'auto_awesome'}
          </span>
        </div>

        <input
          id="ai-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}

        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="shrink-0 px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium disabled:opacity-40 transition-opacity hover:opacity-90 cursor-pointer"
        >
          {isSearching ? '…' : 'Search'}
        </button>
      </div>

      {/* AI label */}
      <div className="absolute -top-2 left-3 px-1 bg-[var(--color-bg)]">
        <span className="text-[10px] font-medium text-[var(--color-primary)] uppercase tracking-wider">AI Search</span>
      </div>
    </form>
  );
}
