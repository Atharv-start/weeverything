'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Tooltip } from '@/components/ui/Tooltip';
import clsx from 'clsx';

const SCROLL_THRESHOLD = 400;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > SCROLL_THRESHOLD);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reset visibility on route change
  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <Tooltip content="Back to top" position="left">
      <button
        id="scroll-to-top-btn"
        onClick={scrollToTop}
        onKeyDown={handleKeyDown}
        aria-label="Scroll back to top"
        tabIndex={0}
        className={clsx(
          // Position: above AI Copilot FAB
          'fixed z-40 right-4 bottom-36 lg:right-6 lg:bottom-24',
          'w-10 h-10 rounded-full cursor-pointer',
          'glass-card border border-[var(--color-border)] text-[var(--color-text-muted)]',
          'hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
          'flex items-center justify-center shadow-lg',
          'transition-all duration-300',
          visible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
          // Hide on print
          'print:hidden',
        )}
      >
        <span className="material-symbols-outlined text-lg">keyboard_arrow_up</span>
      </button>
    </Tooltip>
  );
}
