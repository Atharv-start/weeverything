import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 text-lg text-[var(--color-text-muted)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'input-neon',
              icon && 'pl-10',
              error && 'border-rose-500/50 focus:border-rose-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-rose-400 font-mono tracking-wide">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
