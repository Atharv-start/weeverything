'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset on route change
    setProgress(0);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        setProgress(pct);
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[9990] h-[2px] pointer-events-none print:hidden"
      aria-hidden={progress === 0}
    >
      <div
        className="h-full bg-[var(--color-primary)] transition-none"
        style={{
          width: `${progress}%`,
          boxShadow: progress > 0 ? '0 0 8px var(--color-primary-glow)' : 'none',
        }}
      />
    </div>
  );
}
