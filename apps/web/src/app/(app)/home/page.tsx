'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useAnimeStagger } from '@/lib/anime';
import { SpotlightCard } from '@/components/react-bits/SpotlightCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { AuthModal } from '@/components/ui/AuthModal';
import { OrbitImages } from '@/components/react-bits/OrbitImages';
import { DecryptedText } from '@/components/react-bits/DecryptedText';

const FEATURED_APPS = [
  { slug: 'whatsapp', name: 'WhatsApp Hub', icon: 'chat', href: '/mini-apps/whatsapp', category: 'Communication', desc: 'Direct messaging & WhatsApp click-to-chat' },
  { slug: 'ai-suite', name: 'Super AI Suite', icon: 'auto_awesome', href: '/mini-apps/ai-suite', category: 'Intelligence', desc: 'GPT-4o & Claude 3.5 AI assistants' },
  { slug: 'wallet', name: 'UPI & Wallet', icon: 'account_balance_wallet', href: '/wallet', category: 'Fintech', desc: 'Instant UPI payments & passbook' },
  { slug: 'workspace', name: 'Teams Workspace', icon: 'dashboard', href: '/workspace', category: 'Productivity', desc: 'Projects, tasks & team collaboration' },
  { slug: 'notes', name: 'Notes & AI Memos', icon: 'description', href: '/mini-apps/notes', category: 'Utilities', desc: 'Smart markdown notes & voice memos' },
  { slug: 'calculator', name: 'Calculators', icon: 'calculate', href: '/mini-apps/calculator', category: 'Tools', desc: 'Financial, GST & scientific calculators' },
];

const QUICK_ACTIONS = [
  { label: 'New Chat', icon: 'chat_bubble', href: '/chats', protected: false },
  { label: 'Transfer Money', icon: 'send_money', href: '/wallet', protected: true, actionName: 'make UPI payments' },
  { label: 'Create Post', icon: 'add_photo_alternate', href: '/moments', protected: true, actionName: 'create Moment posts' },
  { label: 'Launch AI', icon: 'auto_awesome', href: '/mini-apps/ai-suite', protected: false },
  { label: 'New Note', icon: 'post_add', href: '/mini-apps/notes', protected: false },
];



export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = Boolean(user || accessToken);
  const { requireAuth, authModalOpen, closeAuthModal, protectedActionName } = useAuthGuard();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-10 pb-16">
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} actionName={protectedActionName} />

      {/* ── 1. HERO SECTION & ORBIT VISUAL CENTERPIECE ── */}
      <div className="anime-stagger header-floating p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-[var(--color-border)]">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="neon">
              {isAuthenticated ? 'CONNECTED WORKSPACE' : 'SUPER APP ECOSYSTEM'}
            </Badge>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text)] leading-tight">
            {isAuthenticated ? (
              <>
                Welcome back,{' '}
                <DecryptedText text={user?.displayName?.split(' ')[0] || 'Explorer'} className="text-[var(--color-primary)]" />
              </>
            ) : (
              <>
                One App For <DecryptedText text="Everything" className="text-[var(--color-primary)]" />
              </>
            )}
          </h1>

          <p className="font-body text-sm md:text-base text-[var(--color-text-muted)] max-w-xl leading-relaxed">
            {isAuthenticated
              ? 'Your central hub for instant messaging, wallet transactions, team workspaces, mini apps, and AI utilities.'
              : 'Connect, chat, transfer funds via UPI, launch mini apps, and manage daily workflows through a single unified digital operating system.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Button href="/workspace" variant="primary" size="lg" icon="dashboard">
                  Open Workspace
                </Button>
                <Button href="/mini-apps" variant="secondary" size="lg" icon="apps">
                  Explore Mini Apps
                </Button>
              </>
            ) : (
              <>
                <Button href="/auth/register" variant="primary" size="lg" icon="rocket_launch">
                  Get Started Free
                </Button>
                <Button href="/app-store" variant="secondary" size="lg" icon="storefront">
                  Explore Mini App Store
                </Button>
                <Button href="/auth/login" variant="secondary" size="lg">
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Orbit Visualization */}
        <div className="lg:col-span-5 flex justify-center">
          <OrbitImages mode={isAuthenticated ? 'user' : 'guest'} />
        </div>
      </div>

      {/* ── 2. UNIVERSAL SEARCH BAR ── */}
      <form onSubmit={handleSearchSubmit} className="anime-stagger max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-5 text-[var(--color-primary)] text-2xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, messages, moments, contacts, or commands..."
            className="w-full pl-14 pr-24 py-4 rounded-2xl glass-card border border-[var(--color-border)] focus:border-[var(--color-primary)] text-sm font-body text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none transition-all shadow-xl"
          />
          <button
            type="submit"
            className="absolute right-3 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-mono text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      {/* ── 3. QUICK ACTIONS BAR ── */}
      <div className="anime-stagger space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-bold text-center">
          Quick Actions
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {QUICK_ACTIONS.map((act, i) => (
            <button
              key={i}
              onClick={() => {
                if (act.protected) {
                  requireAuth(() => router.push(act.href), act.actionName || 'perform action');
                } else {
                  router.push(act.href);
                }
              }}
              className="px-4 py-2.5 rounded-xl glass-card border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] text-xs font-mono font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base text-[var(--color-primary)]">{act.icon}</span>
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. FEATURED MINI APPS ── */}
      <div className="anime-stagger space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg tracking-tight flex items-center gap-2 text-[var(--color-text)]">
            <span className="material-symbols-outlined text-[var(--color-primary)]">apps</span>
            Featured Ecosystem Apps
          </h2>
          <Link href="/mini-apps" className="font-mono text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
            Browse All <span className="material-symbols-outlined text-xs">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_APPS.map((app) => (
            <Link
              key={app.slug}
              href={app.href}
              className="glass-card rounded-2xl p-5 flex items-start gap-4 group cursor-pointer transition-all hover:scale-[1.02] hover:border-[var(--color-primary)]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex-shrink-0 transition-transform group-hover:scale-110 group-hover:glow-neon">
                <span className="material-symbols-outlined text-2xl">{app.icon}</span>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                    {app.name}
                  </h3>
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-[var(--color-surface-bright)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    {app.category}
                  </span>
                </div>
                <p className="font-body text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                  {app.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5. ONBOARDING / GET STARTED SECTION ── */}
      <div className="anime-stagger grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workspace CTA */}
        <SpotlightCard className="p-6 border-[var(--color-border)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">dashboard</span>
                {isAuthenticated ? 'Your Workspace' : 'Team Collaboration'}
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
              {isAuthenticated ? 'Projects & Tasks' : 'Build Together'}
            </h3>
            <p className="font-body text-xs text-[var(--color-text-muted)]">
              {isAuthenticated
                ? 'Manage your projects, track tasks, and collaborate with your team — all in one place.'
                : 'Create projects, assign tasks, and collaborate in real time with your team.'}
            </p>
          </div>
          <Button href="/workspace" variant="primary" size="sm" icon="arrow_forward">
            {isAuthenticated ? 'Open Workspace' : 'Get Started'}
          </Button>
        </SpotlightCard>

        {/* Mini Apps CTA */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">apps</span>
              Explore Mini Apps
            </h3>
            <a href="/mini-apps" className="font-mono text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">View All</a>
          </div>

          <div className="space-y-2">
            {FEATURED_APPS.slice(0, 3).map((app) => (
              <a
                key={app.slug}
                href={app.href}
                className="p-3 rounded-xl flex items-center gap-3 transition-all group cursor-pointer block hover:bg-[var(--color-surface-bright)]/40 border border-transparent hover:border-[var(--color-border)]"
              >
                <span className="material-symbols-outlined text-xl text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                  {app.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-bold text-xs truncate text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                    {app.name}
                  </h4>
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)]">{app.category}</p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 6. FOOTER WITH LEGAL LINKS ── */}
      <footer className="anime-stagger pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--color-text-muted)]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse glow-neon" />
          <span className="font-bold text-[var(--color-text)]">WeEverything</span>
          <span>•</span>
          <span>&copy; {new Date().getFullYear()} WeEverything Technologies</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/mini-apps" className="hover:text-[var(--color-primary)] transition-colors">Mini Apps</Link>
          <Link href="/app-store" className="hover:text-[var(--color-primary)] transition-colors">App Store</Link>
          <Link href="/settings" className="hover:text-[var(--color-primary)] transition-colors">Settings</Link>
          <span className="text-[var(--color-border)]">|</span>
          <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Terms</Link>
          <Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">About</Link>
          <Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
