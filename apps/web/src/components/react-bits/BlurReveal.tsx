'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export interface BlurRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export function BlurReveal({
  children,
  className = '',
  delay = 0.1,
  duration = 0.6,
  yOffset = 15,
  ...props
}: BlurRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    gsap.fromTo(
      elementRef.current,
      {
        opacity: 0,
        y: yOffset,
        filter: 'blur(8px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: 'power2.out',
      }
    );
  }, [delay, duration, yOffset]);

  return (
    <div ref={elementRef} className={cn('opacity-0', className)} {...props}>
      {children}
    </div>
  );
}
