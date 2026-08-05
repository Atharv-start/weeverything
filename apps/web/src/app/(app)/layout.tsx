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

import { useTheme } from '@/lib/theme';

type ThemeMode = 'dark' | 'light' | 'system';

const NAV_ITEMS = [
  { href: '/home', icon: 'home', label: 'Home' },
  { href: '/chats', icon: 'chat_bubble', label: 'Chats' },
  { href: '/moments', icon: 'auto_awesome', label: 'Moments' },
  { href: '/channels', icon: 'play_circle', label: 'Channels' },
  { href: '/workspace', icon: 'dashboard', label: 'Workspace' },
  { href: '/wallet', icon: 'account_balance_wallet', label: 'Wallet' },
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

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">

      {/* ── SIDEBAR (React Bits LineSidebar) ────────────────────── */}
      <LineSidebar
        navItems={NAV_ITEMS.filter((item) => {
          if (item.adminOnly) {
            return currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MODERATOR';
          }
          return true;
        })}
        currentUser={currentUser}
        themeIcon={themeIcon}
        themeLabel={themeLabel}
        cycleTheme={cycleTheme}
        isSignedIn={isSignedIn}
        handleLogout={handleLogout}
      />

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main ref={mainContentRef} className="flex-1 lg:ml-64 min-h-screen bg-[var(--color-bg)] transition-colors duration-300">
        {children}
      </main>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 glass-header border-t border-[var(--color-border)]">
        {NAV_ITEMS.slice(0, 5).map(({ href, icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 p-2 transition-all rounded-lg',
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              <span className="text-[9px] font-mono uppercase tracking-wider font-bold">{label}</span>
            </Link>
          );
        })}

        {/* Mobile theme toggle in bottom nav */}
        <button
          onClick={cycleTheme}
          className="flex flex-col items-center gap-1 p-2 transition-all text-[var(--color-text-muted)] hover:text-[var(--color-primary)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">{themeIcon}</span>
          <span className="text-[9px] font-mono uppercase tracking-wider font-bold">{themeLabel}</span>
        </button>
      </nav>

      {/* Developer Observability Panel */}
      <DevInfoPanel />
    </div>
  );
}
