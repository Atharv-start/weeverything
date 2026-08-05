'use client';

import React, { useState, useEffect } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
  encryptedClassName?: string;
  animateOn?: 'hover' | 'mount' | 'both';
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?';

export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  className = '',
  encryptedClassName = 'text-[var(--color-primary)] font-mono',
  animateOn = 'both',
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  const triggerDecrypt = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / (maxIterations / text.length)) {
              return text[index];
            }
            return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          })
          .join('')
      );

      iteration += 1;
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'mount' || animateOn === 'both') {
      triggerDecrypt();
    }
  }, []);

  const handleMouseEnter = () => {
    if (animateOn === 'hover' || animateOn === 'both') {
      setIsHovered(true);
      triggerDecrypt();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-block cursor-pointer select-none transition-colors ${className}`}
    >
      {displayText.split('').map((char, i) => {
        const isOriginal = char === text[i];
        return (
          <span key={i} className={isOriginal ? '' : encryptedClassName}>
            {char}
          </span>
        );
      })}
    </span>
  );
}
