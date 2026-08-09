'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Tooltip } from './Tooltip';

export interface DraggablePanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  icon?: string;
  headerActions?: React.ReactNode;
  initialAlignment?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'center';
  initialOffset?: { x: number; y: number };
  width?: string; // e.g. "w-80" or "w-[380px]"
  height?: string;
  className?: string;
  id?: string;
}

export function DraggablePanel({
  children,
  isOpen,
  onClose,
  title,
  icon = 'drag_handle',
  headerActions,
  initialAlignment = 'top-right',
  initialOffset = { x: 24, y: 24 },
  width = 'w-80',
  height,
  className,
  id,
}: DraggablePanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; panelX: number; panelY: number }>({
    startX: 0,
    startY: 0,
    panelX: 0,
    panelY: 0,
  });

  // Calculate initial position based on alignment
  const calculateInitialPos = useCallback(() => {
    if (typeof window === 'undefined') return { x: 20, y: 20 };
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const panelW = panelRef.current ? panelRef.current.offsetWidth : 340;
    const panelH = panelRef.current ? panelRef.current.offsetHeight : 450;

    let x = initialOffset.x;
    let y = initialOffset.y;

    if (initialAlignment === 'top-right') {
      x = vpW - panelW - initialOffset.x;
      y = initialOffset.y;
    } else if (initialAlignment === 'bottom-right') {
      x = vpW - panelW - initialOffset.x;
      y = vpH - panelH - initialOffset.y;
    } else if (initialAlignment === 'bottom-left') {
      x = initialOffset.x;
      y = vpH - panelH - initialOffset.y;
    } else if (initialAlignment === 'top-left') {
      x = initialOffset.x;
      y = initialOffset.y;
    } else if (initialAlignment === 'center') {
      x = (vpW - panelW) / 2;
      y = (vpH - panelH) / 2;
    }

    // Clamp within viewport
    x = Math.max(8, Math.min(x, vpW - panelW - 8));
    y = Math.max(8, Math.min(y, vpH - panelH - 8));

    return { x, y };
  }, [initialAlignment, initialOffset.x, initialOffset.y]);

  useEffect(() => {
    if (isOpen && position === null) {
      // Delay slightly for DOM layout calculation
      const timer = setTimeout(() => {
        setPosition(calculateInitialPos());
      }, 20);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, position, calculateInitialPos]);

  // Keep inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!position || !panelRef.current) return;
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const panelW = panelRef.current.offsetWidth;
      const panelH = panelRef.current.offsetHeight;

      const clampedX = Math.max(8, Math.min(position.x, vpW - panelW - 8));
      const clampedY = Math.max(8, Math.min(position.y, vpH - panelH - 8));

      if (clampedX !== position.x || clampedY !== position.y) {
        setPosition({ x: clampedX, y: clampedY });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Pointer drag events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't drag if user interacted with a button, input, textarea, link or no-drag area
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('a') ||
      target.closest('select') ||
      target.closest('.no-drag')
    ) {
      return;
    }

    if (!position) return;

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panelX: position.x,
      panelY: position.y,
    };

    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !panelRef.current) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const panelW = panelRef.current.offsetWidth;
    const panelH = panelRef.current.offsetHeight;

    let newX = dragStartRef.current.panelX + dx;
    let newY = dragStartRef.current.panelY + dy;

    // Viewport clamping
    newX = Math.max(8, Math.min(newX, vpW - panelW - 8));
    newY = Math.max(8, Math.min(newY, vpH - panelH - 8));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.target && (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  if (!isOpen) return null;

  const style: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }
    : {
        position: 'fixed',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 50,
      };

  return (
    <div
      ref={panelRef}
      id={id}
      style={style}
      className={clsx(
        width,
        height,
        'glass-card rounded-2xl border border-[var(--color-primary-glow)] shadow-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl',
        'transition-shadow duration-200 select-none overflow-hidden flex flex-col',
        isDragging && 'shadow-2xl shadow-[var(--color-primary)]/20 ring-2 ring-[var(--color-primary)]/40',
        className
      )}
    >
      {/* Draggable Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={clsx(
          'flex items-center justify-between p-3 border-b border-[var(--color-border)] select-none',
          'bg-gradient-to-r from-[var(--color-primary)]/10 via-transparent to-transparent',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Tooltip content="Click and drag to move panel">
            <div className="flex items-center gap-1 text-[var(--color-primary)] hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-base">drag_indicator</span>
              {icon && icon !== 'drag_handle' && icon !== 'drag_indicator' && (
                <span className="material-symbols-outlined text-base">{icon}</span>
              )}
            </div>
          </Tooltip>
          {title && <div className="font-display font-bold text-xs text-[var(--color-text)] truncate">{title}</div>}
        </div>

        <div className="flex items-center gap-1.5 no-drag">
          {headerActions}
          {onClose && (
            <Tooltip content="Close panel">
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[var(--color-surface-bright)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden select-text">{children}</div>
    </div>
  );
}
