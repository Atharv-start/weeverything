'use client';

import React from 'react';
import clsx from 'clsx';

export interface OrbitItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  badge?: string;
}

const GUEST_ORBIT_ITEMS: OrbitItem[] = [
  { id: 'messages', name: 'Messages & Chat', icon: 'chat_bubble', color: '#25D366' },
  { id: 'wallet', name: 'UPI & Payments', icon: 'account_balance_wallet', color: '#DFFF00', badge: 'UPI' },
  { id: 'ai', name: 'Super AI Assistant', icon: 'auto_awesome', color: '#a855f7', badge: 'AI' },
  { id: 'workspace', name: 'Teams & Tasks', icon: 'dashboard', color: '#3b82f6' },
  { id: 'channels', name: 'Channels Reels', icon: 'play_circle', color: '#ff0000' },
  { id: 'moments', name: 'Moments Feed', icon: 'auto_awesome', color: '#ec4899' },
  { id: 'notes', name: 'Notes & Memos', icon: 'description', color: '#10b981' },
  { id: 'calendar', name: 'Calendar & Meet', icon: 'calendar_month', color: '#4285f4' },
  { id: 'mail', name: 'Mail Sync', icon: 'mail', color: '#ea4335' },
  { id: 'drive', name: 'Cloud Drive', icon: 'cloud', color: '#06b6d4' },
  { id: 'food', name: 'Food & Zomato', icon: 'restaurant', color: '#e23744' },
  { id: 'travel', name: 'Travel & IRCTC', icon: 'train', color: '#f59e0b' },
];

const SIGNED_IN_ORBIT_ITEMS: OrbitItem[] = [
  { id: 'workspace', name: 'Active Workspace', icon: 'dashboard', color: '#DFFF00', badge: 'ACTIVE' },
  { id: 'chats', name: 'Messages', icon: 'chat_bubble', color: '#3b82f6' },
  { id: 'wallet', name: 'UPI Wallet', icon: 'account_balance_wallet', color: '#10b981' },
  { id: 'ai', name: 'Super AI Suite', icon: 'auto_awesome', color: '#a855f7' },
  { id: 'notes', name: 'Pinned Memos', icon: 'description', color: '#06b6d4' },
  { id: 'channels', name: 'My Channels', icon: 'play_circle', color: '#ec4899' },
  { id: 'calendar', name: 'Today Schedule', icon: 'calendar_month', color: '#4285f4' },
  { id: 'tasks', name: 'My Tasks', icon: 'task_alt', color: '#f59e0b' },
];

interface OrbitImagesProps {
  mode?: 'guest' | 'user';
  customItems?: OrbitItem[];
  className?: string;
}

export function OrbitImages({ mode = 'guest', customItems, className }: OrbitImagesProps) {
  const items = customItems || (mode === 'user' ? SIGNED_IN_ORBIT_ITEMS : GUEST_ORBIT_ITEMS);

  return (
    <div className={clsx('relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center overflow-hidden py-4', className)}>
      {/* Outer Orbit Ring */}
      <div className="absolute inset-4 rounded-full border border-[var(--color-primary-glow)] border-dashed animate-[spin_40s_linear_infinite] opacity-60" />

      {/* Middle Orbit Ring */}
      <div className="absolute inset-16 rounded-full border border-[var(--color-border)] animate-[spin_25s_linear_infinite_reverse] opacity-80" />

      {/* Center Core Badge */}
      <div className="relative z-10 w-24 h-24 rounded-full glass-card border-2 border-[var(--color-primary)] flex flex-col items-center justify-center p-2 text-center shadow-2xl glow-neon animate-pulse">
        <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">hub</span>
        <span className="font-display font-extrabold text-[10px] uppercase tracking-tighter text-[var(--color-text)] mt-0.5">
          WeEverything
        </span>
        <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-primary)] font-bold">
          {mode === 'user' ? 'WORKSPACE' : 'ECOSYSTEM'}
        </span>
      </div>

      {/* Orbiting App Items */}
      {items.map((item, index) => {
        const total = items.length;
        const angle = (index / total) * 360;
        const radius = 135; // px distance from center

        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        return (
          <div
            key={item.id}
            className="absolute transition-transform duration-500 hover:scale-125 z-20 group cursor-pointer"
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            <div className="relative flex flex-col items-center">
              <div
                className="w-11 h-11 rounded-2xl glass-card border border-[var(--color-border)] flex items-center justify-center shadow-lg transition-all group-hover:border-[var(--color-primary)] group-hover:shadow-[0_0_15px_rgba(223,255,0,0.4)]"
                style={{ backgroundColor: 'rgba(15, 15, 15, 0.85)' }}
              >
                <span
                  className="material-symbols-outlined text-xl transition-transform group-hover:scale-110"
                  style={{ color: item.color || 'var(--color-primary)' }}
                >
                  {item.icon}
                </span>
              </div>

              {/* Hover Name Tag */}
              <div className="absolute top-12 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-surface-bright)] text-[var(--color-text)] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-[var(--color-border)] shadow-xl pointer-events-none z-30">
                {item.name}
              </div>

              {item.badge && (
                <span className="absolute -top-1 -right-1 font-mono text-[7px] font-extrabold px-1 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] uppercase tracking-tight">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
