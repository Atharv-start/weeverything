import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl relative overflow-hidden';

  const variants = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full flex-shrink-0',
    rectangular: 'rounded-xl',
    card: 'h-32 w-full rounded-2xl',
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[var(--color-border-subtle)] to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-1/3 h-4" />
          <Skeleton variant="text" className="w-1/4 h-3" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="h-24 w-full" />
      <div className="flex justify-between pt-2">
        <Skeleton variant="text" className="w-1/4 h-4" />
        <Skeleton variant="text" className="w-1/4 h-4" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-8 space-y-6 animate-pulse">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-3 flex-1">
          <Skeleton variant="text" className="w-1/4 h-5" />
          <Skeleton variant="text" className="w-2/3 h-10" />
          <Skeleton variant="text" className="w-1/2 h-4" />
        </div>
        <Skeleton variant="circular" className="w-16 h-16" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="w-1/3 h-4" />
              <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
          </div>
          <Skeleton variant="rectangular" className="w-16 h-8" />
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)] animate-pulse">
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <Skeleton variant="rectangular" className="h-10 w-full mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="w-1/2 h-4" />
              <Skeleton variant="text" className="w-3/4 h-3" />
            </div>
          </div>
        ))}
      </div>
      <div className="md:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="w-1/4 h-5" />
            <Skeleton variant="text" className="w-1/6 h-3" />
          </div>
        </div>
        <div className="space-y-4 flex-1 py-4">
          <Skeleton variant="rectangular" className="h-16 w-2/3" />
          <Skeleton variant="rectangular" className="h-14 w-1/2 ml-auto" />
          <Skeleton variant="rectangular" className="h-20 w-3/4" />
        </div>
        <Skeleton variant="rectangular" className="h-12 w-full" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-wrapper-wide space-y-8 p-6">
      <HeroSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ListSkeleton count={4} />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
