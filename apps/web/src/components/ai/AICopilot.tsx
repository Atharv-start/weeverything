'use client';

import { useState, useCallback } from 'react';
import { CopilotPanel } from './CopilotPanel';
import { DraggablePanel } from '@/components/ui/DraggablePanel';
import { Tooltip } from '@/components/ui/Tooltip';

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <Tooltip content="Open AI Copilot Assistant" position="left">
          <button
            id="ai-copilot-trigger"
            onClick={toggle}
            aria-label="Open AI Copilot"
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 rounded-full shadow-xl cursor-pointer bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-[var(--color-primary)]/30 glow-neon"
          >
            <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
            <span className="absolute inset-0 rounded-full bg-[var(--color-primary)]/30 animate-ping pointer-events-none" />
          </button>
        </Tooltip>
      )}

      {/* Movable AI Copilot Panel */}
      <DraggablePanel
        isOpen={isOpen}
        onClose={close}
        title="AI Copilot Assistant"
        icon="auto_awesome"
        initialAlignment="bottom-right"
        initialOffset={{ x: 24, y: 80 }}
        width="w-[min(380px,calc(100vw-2rem))]"
        height="h-[520px]"
      >
        <CopilotPanel onClose={close} />
      </DraggablePanel>
    </>
  );
}
