'use client';

import { useState, useCallback, useRef } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import clsx from 'clsx';

interface CopyButtonProps {
  value: string;
  label?: string;
  /** Show text label next to icon */
  showLabel?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({
  value,
  label = 'Copy',
  showLabel = false,
  tooltipPosition = 'top',
  className,
  size = 'sm',
}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    if (state === 'copied') return;

    // Clear any pending reset
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older browsers / insecure contexts
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.cssText = 'position:fixed;opacity:0;top:-9999px;left:-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('execCommand copy failed');
      }

      setState('copied');
      timeoutRef.current = setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error('[CopyButton] Copy failed:', err);
      setState('error');
      timeoutRef.current = setTimeout(() => setState('idle'), 2000);
    }
  }, [value, state]);

  const icon =
    state === 'copied' ? 'check_circle' : state === 'error' ? 'error' : 'content_copy';
  const tooltipContent =
    state === 'copied' ? 'Copied!' : state === 'error' ? 'Copy failed — try manually' : label;
  const textColor =
    state === 'copied'
      ? 'text-[var(--color-success)]'
      : state === 'error'
      ? 'text-[var(--color-error)]'
      : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]';

  const iconSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <Tooltip content={tooltipContent} position={tooltipPosition}>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={tooltipContent}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-lg transition-colors duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
          size === 'sm' ? 'p-1' : 'p-1.5',
          textColor,
          className,
        )}
      >
        <span className={clsx('material-symbols-outlined', iconSize)}>{icon}</span>
        {showLabel && (
          <span className="text-xs font-mono">
            {state === 'copied' ? 'Copied!' : state === 'error' ? 'Error' : label}
          </span>
        )}
      </button>
    </Tooltip>
  );
}
