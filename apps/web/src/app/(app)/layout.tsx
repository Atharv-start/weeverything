'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import gsap from 'gsap';
import { Button } from '@/components/ui/Button';
import { DevInfoPanel } from '@/components/DevInfoPanel';
import { LineSidebar } from '@/components/react-bits/LineSidebar';
import { AICopilot } from '@/components/ai/AICopilot';

import { useTheme } from '@/lib/theme';

type ThemeMode = 'dark' | 'light' | 'system';

const NAV_ITEMS = [
  { href: '/home', icon: 'home', label: 'Home' },
  { href: '/chats', icon: 'chat_bubble', label: 'Chats' },
  { href: '/moments', icon: 'auto_awesome', label: 'Moments' },
  { href: '/channels', icon: 'play_circle', label: 'Channels' },
  { href: '/workspace', icon: 'dashboard', label: 'Workspace' },
  { href: '/wallet', icon: 'account_balance_wallet', label: 'Wallet' },
  { href: '/ai', icon: 'smart_toy', label: 'AI Hub' },
  { href: '/mini-apps', icon: 'apps', label: 'Mini Apps' },
  { href: '/app-store', icon: 'storefront', label: 'App Store' },
  { href: '/search', icon: 'search', label: 'Search' },
  { href: '/notifications', icon: 'notifications', label: 'Notifications' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
  { href: '/admin', icon: 'security', label: 'Admin', adminOnly: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const mainContentRef = useRef<HTMLElement>(null);
  const { theme, cycleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // GSAP page transition trigger on route change
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0.8, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [pathname]);

  const themeIcon = theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'brightness_auto';
  const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

  async function handleLogout() {
    await signOut();
    router.push('/auth/login');
  }

  // Display user or fallback guest state
  const currentUser = user || { displayName: 'Guest Explorer', username: 'guest', role: 'GUEST' };

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) {
      return currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MODERATOR';
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">

      {/* ── MOBILE TOP HEADER BAR (lg:hidden) ─────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 glass-header border-b border-[var(--color-border)] px-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-[var(--color-text-inverse)] flex items-center justify-center font-bold font-display glow-neon">
            W
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight text-[var(--color-text)]">
            We<span className="text-[var(--color-primary)]">Everything</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-primary)] cursor-pointer active:scale-95"
            aria-label="Cycle Theme"
          >
            <span className="material-symbols-outlined text-lg">{themeIcon}</span>
          </button>

          <Link
            href="/notifications"
            className="p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer relative"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] absolute top-1.5 right-1.5 glow-neon" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[var(--color-surface-bright)] border border-[var(--color-border)] text-[var(--color-text)] cursor-pointer active:scale-95"
            aria-label="Toggle Mobile Navigation"
          >
            <span className="material-symbols-outlined text-lg">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* ── MOBILE SLIDE-OVER NAVIGATION DRAWER ──────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
          />

          <div className="relative w-4/5 max-w-xs ml-auto h-full glass-header border-l border-[var(--color-border)] p-5 flex flex-col justify-between overflow-y-auto animate-slide-left z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] flex items-center justify-center font-bold text-sm flex-shrink-0 glow-neon">
                    {currentUser?.displayName?.[0]?.toUpperCase() || 'G'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-[var(--color-text)]">{currentUser?.displayName || 'Guest Explorer'}</p>
                    <p className="text-[10px] font-mono truncate text-[var(--color-text-muted)]">@{currentUser?.username || 'guest'}</p>
                  </div>
                </div>

                <button onClick={() => setMobileMenuOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase font-bold text-[var(--color-text-muted)] px-3 mb-2">
                  SUPER APP OS MENU
                </p>
                {filteredNavItems.map(({ href, icon, label }) => {
                  const isActive = pathname === href || (href !== '/home' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        'px-3.5 py-2.5 flex items-center justify-between text-xs font-mono rounded-xl transition-all',
                        isActive
                          ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] font-bold'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-bright)]/40'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                        <span>{label}</span>
                      </div>
                      <span className="material-symbols-outlined text-sm opacity-50">chevron_right</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
              <Link
                href="/mini-apps"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl font-mono text-xs uppercase font-bold text-center block btn-neon"
              >
                🚀 Launch Mini App
              </Link>

              {isSignedIn ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full py-2 px-3 text-xs font-mono rounded-xl text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 text-center block cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-xl font-mono text-xs font-bold text-center text-black bg-[var(--color-primary)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-xl font-mono text-xs font-bold text-center text-white border border-[var(--color-border)]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ───────────────────────────────────── */}
      <LineSidebar
        navItems={filteredNavItems}
        currentUser={currentUser}
        themeIcon={themeIcon}
        themeLabel={themeLabel}
        cycleTheme={cycleTheme}
        isSignedIn={isSignedIn}
        handleLogout={handleLogout}
      />

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main
        ref={mainContentRef}
        className="flex-1 lg:ml-64 min-h-screen pt-20 pb-28 px-4 sm:px-6 lg:px-8 lg:pt-8 lg:pb-16 bg-[var(--color-bg)] transition-colors duration-300"
      >
        {children}
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 glass-header border-t border-[var(--color-border)]">
        {[
          { href: '/home', icon: 'home', label: 'Home' },
          { href: '/chats', icon: 'chat_bubble', label: 'Chats' },
          { href: '/moments', icon: 'auto_awesome', label: 'Moments' },
          { href: '/wallet', icon: 'account_balance_wallet', label: 'Wallet' },
        ].map(({ href, icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-1.5 transition-all rounded-xl active:scale-95',
                isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              <span className="text-[9px] font-mono uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}

        {/* Mobile Menu Drawer Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={clsx(
            'flex flex-col items-center gap-1 px-3 py-1.5 transition-all rounded-xl active:scale-95 cursor-pointer',
            mobileMenuOpen ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          )}
        >
          <span className="material-symbols-outlined text-xl">menu</span>
          <span className="text-[9px] font-mono uppercase tracking-wider">More</span>
        </button>
      </nav>

      {/* Developer Observability Panel */}
      <DevInfoPanel />

      {/* Global AI Copilot */}
      <AICopilot />
    </div>
  );
}
