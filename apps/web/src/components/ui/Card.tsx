import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'raised' | 'interactive';
  glowing?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', glowing = false, children, ...props }, ref) => {
    const baseStyle = 'rounded-2xl border transition-all duration-300 relative overflow-hidden';
    
    const variants = {
      default: 'bg-[var(--color-surface)] border-[var(--color-border)]',
      glass: 'glass-card',
      raised: 'bg-[var(--color-surface-raised)] border-[var(--color-border)] shadow-lg',
      interactive: 'glass-card hover:border-[var(--color-primary)] hover:-translate-y-0.5 cursor-pointer',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyle,
          variants[variant],
          glowing && 'glow-neon border-[var(--color-primary)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pb-4 border-b border-[var(--color-border)]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-4 border-t border-[var(--color-border)] bg-[var(--color-surface-dim)]/50', className)} {...props}>
      {children}
    </div>
  );
}
