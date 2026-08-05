import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neon' | 'neutral' | 'success' | 'warning' | 'error';
  icon?: string;
}

export function Badge({ className, variant = 'neon', icon, children, ...props }: BadgeProps) {
  const variants = {
    neon: 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.3)]',
    neutral: 'bg-white/5 text-[var(--color-text-muted)] border border-white/10',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-xs">{icon}</span>}
      {children}
    </span>
  );
}
