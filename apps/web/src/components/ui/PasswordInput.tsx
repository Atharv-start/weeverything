'use client';

import React, { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
  label?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputId = id ?? 'password-input';

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {/* Lock icon */}
          <span className="material-symbols-outlined absolute left-3 text-lg text-[var(--color-text-muted)] pointer-events-none">
            lock
          </span>

          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            autoComplete={props.autoComplete ?? 'current-password'}
            className={cn(
              'input-neon pl-10 pr-10',
              error && 'border-rose-500/50 focus:border-rose-500',
              className,
            )}
            {...props}
          />

          {/* Toggle visibility button */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-controls={inputId}
            className={cn(
              'absolute right-3 p-0.5 rounded',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              'transition-colors cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1',
            )}
          >
            <span className="material-symbols-outlined text-lg select-none">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>

        {error && (
          <p role="alert" className="text-xs text-rose-400 font-mono tracking-wide">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
