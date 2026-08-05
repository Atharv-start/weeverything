'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { setAuthToken } from '@/lib/api';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import clsx from 'clsx';

type SearchCategory = 'all' | 'chats' | 'posts' | 'channels' | 'notes' | 'files' | 'events' | 'polls' | 'apps';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  icon: string;
  href: string;
}

const DUMMY_SEARCH_INDEX: SearchResultItem[] = [
  { id: '1', title: 'Indian App Launchers Matrix', subtitle: 'Mini App: 80+ Indian deep links (Zepto, Zomato, Groww)', category: 'apps', icon: 'rocket_launch', href: '/mini-apps/launchers' },
  { id: '2', title: 'AI Assistant & Intelligence Hub', subtitle: 'Mini App: AI Search, Summarizer & Indian Translator', category: 'apps', icon: 'auto_awesome', href: '/mini-apps/ai-suite' },
  { id: '3', title: 'UPI Intent Checkout & NPCI Gateway', subtitle: 'Wallet: Pay via PhonePe, GPay, Paytm & QR Code', category: 'all', icon: 'account_balance_wallet', href: '/wallet/upi-checkout' },
  { id: '4', title: 'DigiLocker & UMANG Civic Portal', subtitle: 'Mini Program: Aadhaar, PAN card, DL & EPFO', category: 'apps', icon: 'badge', href: '/mini-program/gov-services' },
  { id: '5', title: 'IRCTC Rail Connect & Flight Booking', subtitle: 'Mini Program: Live train status & PNR tracking', category: 'apps', icon: 'train', href: '/mini-program/train-booking' },
  { id: '6', title: 'Multi-Calculator Engine', subtitle: 'Mini App: Standard, Scientific, EMI, GST (5-28%) & SIP', category: 'apps', icon: 'calculate', href: '/mini-apps/calculator' },
  { id: '7', title: 'Everyday Phone Utilities Suite', subtitle: 'Mini App: Indian weather, QR Scanner & Hardware diagnostics', category: 'apps', icon: 'build', href: '/mini-apps/utilities' },
  { id: '8', title: 'JioHotstar & Indian Entertainment', subtitle: 'Mini App: Streaming, Wynk, Spotify & Live Cricket', category: 'all', icon: 'headphones', href: '/mini-apps/entertainment' },
  { id: '9', title: 'WhatsApp Hub', subtitle: 'Mini App: Click-to-Chat & wa.me deep links', category: 'apps', icon: 'chat', href: '/mini-apps/whatsapp' },
];

export default function SearchPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 30);

  const { accessToken } = useAuthStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(['UPI Payments', 'Zepto', 'IRCTC Train', 'Calculators']);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    const saved = localStorage.getItem('we_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, [accessToken]);

  const handleSearchSubmit = (q: string) => {
    if (!q.trim()) return;
    const updated = Array.from(new Set([q.trim(), ...recentSearches])).slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('we_recent_searches', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('we_recent_searches');
  };

  const filteredResults = DUMMY_SEARCH_INDEX.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div ref={containerRef} className="page-wrapper space-y-8">
      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="section-label">GLOBAL SUPER APP INDEX</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text)]">Universal Search</h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            Single search bar across UPI payments, Indian app launchers, notes, files & mini apps
          </p>
        </div>

        <Button
          onClick={() => { setQuery('AI Suite'); handleSearchSubmit('AI Suite'); }}
          variant="secondary"
          icon="auto_awesome"
        >
          AI Search
        </Button>
      </div>

      {/* Main Search Input */}
      <div className="anime-stagger relative">
        <Input
          icon="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
          placeholder="SEARCH EVERYTHING: 'Zepto', 'UPI', 'IRCTC', 'Calculators'..."
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !query && (
        <div className="anime-stagger space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold">Recent Searches</span>
            <button onClick={clearHistory} className="hover:text-[var(--color-primary)] cursor-pointer text-[10px]">
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  handleSearchSubmit(s);
                }}
                className="px-3 py-1 rounded-lg glass-card border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text)] transition-all cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Matrix */}
      <div className="anime-stagger space-y-3">
        <div className="flex justify-between items-center font-mono text-xs">
          <span className="uppercase text-[10px] font-bold text-[var(--color-text-muted)]">
            Search Index Matches ({filteredResults.length})
          </span>
        </div>

        <div className="space-y-2">
          {filteredResults.map((r) => (
            <Link key={r.id} href={r.href}>
              <Card variant="interactive" className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex items-center justify-center flex-shrink-0 glow-neon">
                    <span className="material-symbols-outlined text-xl">{r.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-sm text-[var(--color-text)] truncate">{r.title}</h4>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] truncate">{r.subtitle}</p>
                  </div>
                </div>

                <Badge variant="neon">
                  {r.category}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
