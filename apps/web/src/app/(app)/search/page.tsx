'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { setAuthToken } from '@/lib/api';
import { aiClient, type SemanticSearchResult } from '@/lib/ai-client';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import clsx from 'clsx';

type SearchScope = 'all' | 'moments' | 'channels' | 'mini-apps' | 'users';

const SCOPE_TABS: { label: string; value: SearchScope; icon: string }[] = [
  { label: 'All', value: 'all', icon: 'search' },
  { label: 'Moments', value: 'moments', icon: 'auto_awesome' },
  { label: 'Channels', value: 'channels', icon: 'play_circle' },
  { label: 'Mini Apps', value: 'mini-apps', icon: 'apps' },
  { label: 'Users', value: 'users', icon: 'person' },
];

const SCOPE_ICON_MAP: Record<string, string> = {
  moments: 'auto_awesome',
  channels: 'play_circle',
  'mini-apps': 'apps',
  users: 'person',
  tasks: 'task_alt',
  wallet: 'account_balance_wallet',
  mini_apps: 'apps',
  all: 'search',
};

function getResultHref(result: SemanticSearchResult): string {
  const scope = result.scope?.toLowerCase() ?? 'all';
  if (scope === 'moments') return `/moments`;
  if (scope === 'channels') return `/channels`;
  if (scope === 'users') return `/u/${result.id}`;
  if (scope === 'mini-apps' || scope === 'mini_apps') return `/mini-apps`;
  if (scope === 'tasks') return `/workspace`;
  return `/search`;
}

export default function SearchPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 30);

  const { accessToken } = useAuthStore();
  const [query, setQuery] = useState('');
  const [activeScope, setActiveScope] = useState<SearchScope>('all');
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    const saved = localStorage.getItem('we_recent_searches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch {}
    }
  }, [accessToken]);

  // Ctrl+K / Cmd+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const saveRecentSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    const updated = Array.from(new Set([q.trim(), ...recentSearches])).slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('we_recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  const performSearch = useCallback(async (q: string, scope: SearchScope) => {
    if (!q.trim()) {
      setResults([]);
      setTotalResults(0);
      setHasSearched(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await aiClient.search(q.trim(), scope);
      setResults(data.results ?? []);
      setTotalResults(data.total ?? 0);
      saveRecentSearch(q.trim());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      // If AI service unavailable, show a helpful message rather than technical error
      setError(
        msg.toLowerCase().includes('network') || msg.toLowerCase().includes('connect')
          ? 'Search is temporarily unavailable. Please try again in a moment.'
          : 'No results found. Try a different search term.',
      );
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [saveRecentSearch]);

  // Debounced search on query/scope change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      void performSearch(query, activeScope);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeScope, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('we_recent_searches');
  };

  return (
    <div ref={containerRef} className="page-wrapper space-y-8 max-w-3xl mx-auto">
      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="section-label">GLOBAL SEARCH</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Universal Search
          </h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            Search across moments, channels, mini-apps, users & more
            <span className="ml-2 px-1.5 py-0.5 rounded bg-[var(--color-surface-bright)] text-[var(--color-text-muted)] font-mono text-[10px] border border-[var(--color-border)]">
              Ctrl+K
            </span>
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="anime-stagger relative">
        <Input
          ref={inputRef}
          icon="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') clearSearch();
          }}
          placeholder="Search WeEverything…"
          aria-label="Search WeEverything"
          autoFocus
        />
        {query && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Scope Tabs */}
      <div className="anime-stagger flex gap-2 overflow-x-auto hide-scrollbar pb-1" role="tablist" aria-label="Search category">
        {SCOPE_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeScope === tab.value}
            onClick={() => setActiveScope(tab.value)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              activeScope === tab.value
                ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/40',
            )}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recent Searches — only when no query */}
      {recentSearches.length > 0 && !query && (
        <div className="anime-stagger space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold">Recent Searches</span>
            <button
              onClick={clearHistory}
              className="hover:text-[var(--color-primary)] cursor-pointer text-[10px] transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="px-3 py-1 rounded-lg glass-card border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text)] transition-all cursor-pointer text-xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3" aria-label="Loading search results" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
              <Skeleton className="w-16 h-6 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex items-center gap-3 p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400">
          <span className="material-symbols-outlined text-xl flex-shrink-0">info</span>
          <p className="text-sm font-mono">{error}</p>
        </div>
      )}

      {/* Empty State — searched but no results */}
      {!isLoading && !error && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-bright)] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">search_off</span>
          </div>
          <p className="font-display font-bold text-[var(--color-text)]">No results for "{query}"</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            Try different keywords, or switch to a different category tab.
          </p>
          <Button variant="secondary" icon="refresh" onClick={clearSearch}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && results.length > 0 && (
        <div className="space-y-3" role="list" aria-label="Search results">
          <div className="flex justify-between items-center font-mono text-xs text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </span>
          </div>

          <div className="space-y-2">
            {results.map((r) => (
              <Link key={`${r.scope}-${r.id}`} href={getResultHref(r)} role="listitem">
                <Card variant="interactive" className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        {SCOPE_ICON_MAP[r.scope?.toLowerCase() ?? 'all'] ?? 'search'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-sm text-[var(--color-text)] truncate">
                        {r.title}
                      </h4>
                      {r.excerpt && (
                        <p className="font-mono text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                          {r.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge variant="neon" className="flex-shrink-0 capitalize">
                    {r.scope?.replace('-', ' ') ?? 'result'}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Default state — no query yet */}
      {!query && !hasSearched && recentSearches.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-dim)] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">search</span>
          </div>
          <p className="font-display font-bold text-[var(--color-text)]">Search WeEverything</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            Find moments, channels, mini-apps, users and more across the entire platform.
          </p>
        </div>
      )}
    </div>
  );
}
