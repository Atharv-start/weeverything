'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  stagger = 0.03,
}: SplitTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll('.split-char');

    gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 20,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        stagger,
        delay,
        ease: 'power3.out',
      }
    );
  }, [text, delay, duration, stagger]);

  const words = text.split(' ');

  return (
    <h1 ref={containerRef} className={cn('inline-block overflow-hidden', className)}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split('').map((char, charIdx) => (
            <span key={charIdx} className="split-char inline-block opacity-0">
              {char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
