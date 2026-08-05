'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export interface MiniAppHeaderProps {
  /** Top category/section tag, e.g. "WELLNESS & FITNESS ENGINE" */
  category?: string;
  /** Main app title, e.g. "Health & Fitness Hub" */
  title: string;
  /** Secondary title badge, e.g. "REALTIME" or "AI POWERED" */
  titleBadge?: string;
  /** Subtitle description text */
  description: string;
  /** Back link destination. Defaults to "/mini-apps". Pass null or false to hide back button */
  backHref?: string | null;
  /** Optional action buttons or controls rendered on the right side of the header */
  actions?: React.ReactNode;
  /** Optional additional class name for custom overrides */
  className?: string;
}

export function MiniAppHeader({
  category,
  title,
  titleBadge,
  description,
  backHref = '/mini-apps',
  actions,
  className = '',
}: MiniAppHeaderProps) {
  return (
    <div
      className={`anime-stagger header-floating p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${className}`}
    >
      <div className="space-y-1 min-w-0 flex-1">
        {(backHref || category) && (
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            {backHref && (
              <Link
                href={backHref}
                aria-label="Back to Mini Apps"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1 font-mono text-xs cursor-pointer group"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
              </Link>
            )}
            {category && <Badge variant="neon">{category}</Badge>}
          </div>
        )}

        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[var(--color-text)] tracking-tight flex items-center gap-3 flex-wrap">
          <span>{title}</span>
          {titleBadge && <Badge variant="neon">{titleBadge}</Badge>}
        </h1>

        <p className="font-body text-xs text-[var(--color-text-muted)] mt-1 max-w-3xl leading-relaxed">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-3 flex-wrap flex-shrink-0 w-full md:w-auto justify-start md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
          {actions}
        </div>
      )}
    </div>
  );
}
