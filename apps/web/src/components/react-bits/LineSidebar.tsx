'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: string;
  adminOnly?: boolean;
}

interface LineSidebarProps {
  navItems: NavItem[];
  currentUser: { displayName?: string; username?: string; role?: string };
  themeIcon: string;
  themeLabel: string;
  cycleTheme: () => void;
  isSignedIn?: boolean;
  handleLogout?: () => void;
}

export function LineSidebar({
  navItems,
  currentUser,
  themeIcon,
  themeLabel,
  cycleTheme,
  isSignedIn,
  handleLogout,
}: LineSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 z-50 glass-header border-r border-[var(--color-border)] select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-[var(--color-border)]">
        <Link href="/home" className="block group">
          <h1 className="font-display text-2xl font-extrabold tracking-tighter transition-colors text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
            WeEverything
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-0.5">
            Super App Operating System
          </p>
        </Link>

        {/* Theme Cycle Button */}
        <button
          onClick={cycleTheme}
          aria-label={`Current theme: ${themeLabel}. Click to cycle light and dark theme.`}
          title={`Theme: ${themeLabel} — click to cycle`}
          className="group flex flex-col items-center gap-0.5 p-2 rounded-xl border border-[var(--color-border)] glass-card text-[var(--color-primary)] hover:border-[var(--color-primary)] focus-ring-neon transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">{themeIcon}</span>
          <span className="font-mono text-[8px] uppercase font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
            {themeLabel}
          </span>
        </button>
      </div>

      {/* React Bits Line-Guided Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar relative">
        {navItems.map(({ href, icon, label, badge }) => {
          const isActive = pathname === href || (href !== '/home' && pathname.startsWith(`${href}`));

          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              className={clsx(
                'px-4 py-2.5 flex items-center justify-between transition-all text-xs font-mono tracking-wide rounded-xl group relative overflow-hidden',
                isActive
                  ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-bright)]/40'
              )}
            >
              {/* React Bits Animated Active Line Indicator */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)] animate-in fade-in duration-300" />
              )}

              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={clsx(
                    'material-symbols-outlined text-lg transition-colors',
                    isActive ? 'text-[var(--color-primary)]' : 'group-hover:text-[var(--color-text)]'
                  )}
                >
                  {icon}
                </span>
                <span className="truncate">{label}</span>
              </div>

              {badge && (
                <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] uppercase tracking-tight">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Session & Actions */}
      <div className="p-4 mt-auto space-y-3 border-t border-[var(--color-border)] glass-card">
        <Link
          href="/mini-apps"
          className="w-full py-2.5 px-4 rounded-xl font-mono text-xs uppercase font-bold text-center block btn-neon"
        >
          Launch Mini App
        </Link>

        {isSignedIn ? (
          <div className="space-y-0.5">
            <Link
              href="/settings"
              className="px-3 py-2 flex items-center gap-3 text-xs font-mono rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-bright)]/40 transition-all"
            >
              <span className="material-symbols-outlined text-base">settings</span>
              <span>Settings</span>
            </Link>
            {handleLogout && (
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 flex items-center gap-3 text-xs font-mono rounded-lg text-[var(--color-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        ) : (
          <div className="pt-1 space-y-2">
            <Link
              href="/auth/login"
              className="w-full block text-center py-2 px-3 rounded-xl font-mono text-xs font-bold text-[var(--color-text-inverse)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="w-full block text-center py-2 px-3 rounded-xl font-mono text-xs font-bold text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all cursor-pointer"
            >
              Register
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2.5 border-t border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 bg-[var(--color-primary)] text-[var(--color-text-inverse)] glow-neon">
            {currentUser?.displayName?.[0]?.toUpperCase() || 'G'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-[var(--color-text)]">{currentUser?.displayName || 'Guest Explorer'}</p>
            <p className="text-[10px] font-mono truncate text-[var(--color-text-muted)]">@{currentUser?.username || 'guest'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
