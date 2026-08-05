'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';
import clsx from 'clsx';

interface MiniAppItem {
  slug: string;
  name: string;
  category: string;
  icon: string;
  href: string;
  description: string;
  badge?: string;
}

const ALL_MINI_APPS: MiniAppItem[] = [
  { slug: 'launchers', name: 'Indian App Matrix', category: 'Utilities', icon: 'rocket_launch', href: '/mini-apps/launchers', description: 'WhatsApp, Zomato, Swiggy, Zepto, Tata 1mg, DigiLocker, IRCTC, Ola, Uber, Paytm quick launchers.', badge: 'POPULAR' },
  { slug: 'ai-suite', name: 'AI Suite', category: 'AI Tools', icon: 'auto_awesome', href: '/mini-apps/ai-suite', description: 'Multilingual Voice AI (10 Indian languages), AI Writing Assistant, Email Composer & Insights.', badge: 'AI POWERED' },
  { slug: 'whatsapp', name: 'WhatsApp Hub', category: 'Communication', icon: 'chat', href: '/mini-apps/whatsapp', description: 'Click-to-Chat without saving contact & direct WhatsApp web protocol deep links.', badge: 'MUST HAVE' },
  { slug: 'google-suite', name: 'Google Workspace', category: 'Productivity', icon: 'work', href: '/mini-apps/google-suite', description: 'Google Calendar events, Meet HD video calls, Gmail inbox compose & Drive files.', badge: 'WORKSPACE' },
  { slug: 'calculator', name: 'Standard & Scientific Calculator', category: 'Tools', icon: 'calculate', href: '/mini-apps/calculator', description: 'Full scientific math engine with history log, memory functions & unit conversions.' },
  { slug: 'notes', name: 'Notes & AI Writer', category: 'Productivity', icon: 'description', href: '/mini-apps/notes', description: 'Rich text note editor with auto-save, AI summary, category tagging & export options.' },
  { slug: 'utilities', name: 'Phone Utilities Suite', category: 'Tools', icon: 'build', href: '/mini-apps/utilities', description: 'QR Code generator/scanner, flashlight toggle, device info, speed test & compass.' },
  { slug: 'clock', name: 'IST Clock & Alarms', category: 'Tools', icon: 'schedule', href: '/mini-apps/clock', description: 'IST Indian Standard Time world clock, alarms, stopwatch & countdown timers.' },
  { slug: 'whiteboard', name: 'Whiteboard Canvas', category: 'Creativity', icon: 'draw', href: '/mini-apps/whiteboard', description: 'Interactive HTML5 canvas for drawing, architecture diagrams & exporting PNGs.' },
  { slug: 'expenses', name: 'Budget & AI Insights', category: 'Finance', icon: 'savings', href: '/mini-apps/expenses', description: 'Track monthly budget, expense categories & AI financial breakdown insights.' },
  { slug: 'learning', name: 'Learning Platforms', category: 'Education', icon: 'school', href: '/mini-apps/learning', description: 'Unacademy, Physics Wallah, NPTEL, GeeksforGeeks & LeetCode learning launcher matrix.' },
  { slug: 'health', name: 'Health Connect Sync', category: 'Health', icon: 'favorite', href: '/mini-apps/health', description: 'Google Fit, Health Connect, Fitbit sync, water reminder & medicine schedule.' },
  { slug: 'entertainment', name: 'JioHotstar & YouTube', category: 'Entertainment', icon: 'headphones', href: '/mini-apps/entertainment', description: 'JioHotstar, JioCinema, Sony LIV, Netflix, Spotify & official embedded YouTube player.', badge: 'MEDIA' },
];

export default function MiniAppsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQ, setSearchQ] = useState<string>('');

  const categories = ['All', 'Utilities', 'AI Tools', 'Communication', 'Productivity', 'Finance', 'Tools', 'Entertainment'];

  const filteredApps = ALL_MINI_APPS.filter(app => {
    const matchesCat = activeCategory === 'All' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQ.toLowerCase()) || app.description.toLowerCase().includes(searchQ.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8">
      <MiniAppHeader
        backHref={null}
        category="WE-OS 2.0 APPLICATION ECOSYSTEM"
        title="Mini Apps Matrix"
        description="14+ zero-install, instant-launch Web Mini Applications tailored for Indian power users"
        actions={
          <Button href="/app-store" variant="primary" icon="storefront">
            Open App Store
          </Button>
        }
      />

      {/* Search Input */}
      <div className="anime-stagger">
        <Input
          icon="search"
          type="text"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="SEARCH MINI APPS & UTILITIES..."
        />
      </div>

      {/* Category Pills */}
      <div className="anime-stagger flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'px-4 py-2 rounded-full font-mono text-xs uppercase font-bold tracking-wider transition-all flex-shrink-0 cursor-pointer border',
              activeCategory === cat ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm' : 'glass-card border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      <div className="anime-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => (
          <Link key={app.slug} href={app.href}>
            <Card variant="interactive" className="p-5 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] glow-neon">
                    <span className="material-symbols-outlined text-2xl">{app.icon}</span>
                  </div>
                  {app.badge && (
                    <Badge variant="neon">
                      {app.badge}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {app.name}
                  </h3>
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)] mt-0.5">{app.category}</p>
                </div>

                <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1 font-mono text-xs font-bold text-[var(--color-primary)] group-hover:translate-x-1 transition-transform">
                Launch Application <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
