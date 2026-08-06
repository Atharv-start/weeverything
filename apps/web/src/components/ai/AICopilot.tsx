'use client';

import { useState, useCallback } from 'react';
import { CopilotPanel } from './CopilotPanel';

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="ai-copilot-trigger"
        onClick={toggle}
        aria-label="Open AI Copilot"
        className={`
          fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50
          w-14 h-14 rounded-full shadow-xl cursor-pointer
          bg-gradient-to-br from-[var(--color-primary)] to-purple-600
          flex items-center justify-center
          transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-2xl hover:shadow-[var(--color-primary)]/30
          ${isOpen ? 'scale-90 rotate-12' : 'scale-100'}
        `}
      >
        <span className="material-symbols-outlined text-white text-2xl">
          {isOpen ? 'close' : 'auto_awesome'}
        </span>
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[var(--color-primary)]/30 animate-ping" />
        )}
      </button>

      {/* Copilot panel */}
      <div
        className={`
          fixed bottom-36 right-4 lg:bottom-24 lg:right-6 z-50
          w-[min(380px,calc(100vw-2rem))] h-[500px]
          rounded-2xl shadow-2xl shadow-black/20 border border-[var(--color-border)]
          bg-[var(--color-bg)] overflow-hidden
          transition-all duration-300 ease-out origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
        `}
      >
        <CopilotPanel onClose={close} />
      </div>
    </>
  );
}
