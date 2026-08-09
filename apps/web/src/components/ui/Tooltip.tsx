'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactElement<any>;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  position = 'top',
  delay = 180,
  children,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; actualPosition: 'top' | 'bottom' | 'left' | 'right' }>({
    top: 0,
    left: 0,
    actualPosition: position,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let targetPos = position;
    let top = 0;
    let left = 0;

    // Flip position if near viewport edge
    if (position === 'top' && triggerRect.top - tooltipRect.height - 8 < 0) {
      targetPos = 'bottom';
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + 8 > viewportHeight) {
      targetPos = 'top';
    } else if (position === 'left' && triggerRect.left - tooltipRect.width - 8 < 0) {
      targetPos = 'right';
    } else if (position === 'right' && triggerRect.right + tooltipRect.width + 8 > viewportWidth) {
      targetPos = 'left';
    }

    if (targetPos === 'top') {
      top = triggerRect.top - tooltipRect.height - 8;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    } else if (targetPos === 'bottom') {
      top = triggerRect.bottom + 8;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    } else if (targetPos === 'left') {
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.left - tooltipRect.width - 8;
    } else {
      // right
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.right + 8;
    }

    // Clamp horizontal position so it stays on screen
    const padding = 8;
    left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));

    setCoords({ top, left, actualPosition: targetPos });
  }, [position]);

  const showTooltip = useCallback(() => {
    if (disabled || !content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay, disabled, content]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
    return undefined;
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Attach ref and event listeners to children clone
  const child = React.Children.only(children);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    child.props.onMouseEnter?.(e);
    showTooltip();
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    child.props.onMouseLeave?.(e);
    hideTooltip();
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    child.props.onFocus?.(e);
    showTooltip();
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    child.props.onBlur?.(e);
    hideTooltip();
  };

  const clonedChild = React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      const childRef = (child as any).ref;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef) {
        childRef.current = node;
      }
    },
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
  });

  return (
    <>
      {clonedChild}
      {isVisible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999,
          }}
          className={clsx(
            'pointer-events-none select-none px-2.5 py-1 rounded-md font-mono text-[11px] font-medium leading-tight shadow-xl',
            'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] backdrop-blur-md',
            'animate-in fade-in zoom-in-95 duration-150',
            className
          )}
        >
          {content}
        </div>
      )}
    </>
  );
}
