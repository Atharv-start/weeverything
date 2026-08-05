import { useEffect } from 'react';
import { animate, stagger } from 'animejs';

/**
 * Custom hook to run anime.js staggered fade-in + slide-up on a container selector
 */
export function useAnimeStagger(
  containerRef: React.RefObject<HTMLElement | null>,
  targetSelector: string = '.anime-stagger',
  delay: number = 60
) {
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const elements = containerRef.current.querySelectorAll(targetSelector);
    if (!elements || elements.length === 0) return;

    try {
      animate(elements, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.98, 1],
        delay: stagger(delay),
        duration: 600,
        ease: 'outCubic',
      });
    } catch {
      // Fallback grace
    }
  }, [containerRef, targetSelector, delay]);
}

/**
 * Animate numbers counting up from start to end value
 */
export function animateCountUp(
  element: HTMLElement | null,
  startVal: number,
  endVal: number,
  duration: number = 1500,
  prefix: string = '',
  suffix: string = ''
) {
  if (typeof window === 'undefined' || !element) return;

  try {
    const obj = { value: startVal };
    animate(obj, {
      value: endVal,
      duration,
      ease: 'outExpo',
      onUpdate: () => {
        if (element) element.innerHTML = `${prefix}${Math.round(obj.value).toLocaleString()}${suffix}`;
      },
    });
  } catch {
    if (element) element.innerHTML = `${prefix}${endVal.toLocaleString()}${suffix}`;
  }
}

/**
 * Animate progress bar width smoothly from 0% to target%
 */
export function animateProgressBar(element: HTMLElement | null, targetWidthPercent: number, duration: number = 1000) {
  if (typeof window === 'undefined' || !element) return;

  try {
    animate(element, {
      width: [`0%`, `${targetWidthPercent}%`],
      duration,
      ease: 'outQuint',
    });
  } catch {
    if (element) element.style.width = `${targetWidthPercent}%`;
  }
}

/**
 * Pulse effect for interactive cards or active badges
 */
export function animatePulse(element: HTMLElement | null) {
  if (typeof window === 'undefined' || !element) return;

  try {
    animate(element, {
      scale: [1, 1.05, 1],
      duration: 400,
      ease: 'inOutQuad',
    });
  } catch {
    // Fallback grace
  }
}
