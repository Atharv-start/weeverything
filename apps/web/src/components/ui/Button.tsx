import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  isLoading?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, isLoading, href, children, disabled, target, rel, ...props }, ref) => {
    const variants = {
      primary: 'btn-neon',
      secondary: 'btn-glass',
      outline: 'btn-outline-neon',
      ghost: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] transition-all cursor-pointer',
      danger: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[11px]',
      md: 'px-5 py-2.5 text-xs',
      lg: 'px-6 py-3.5 text-sm',
    };

    const content = (
      <>
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : icon ? (
          <span className="material-symbols-outlined text-base">{icon}</span>
        ) : null}
        {children}
      </>
    );

    const combinedClassName = cn(variants[variant], sizes[size], className);

    if (href && !disabled && !isLoading) {
      return (
        <Link href={href} target={target} rel={rel} className={combinedClassName}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

