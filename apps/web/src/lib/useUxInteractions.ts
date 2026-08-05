/**
 * Enterprise UX Micro-Interactions & Anime.js Helper Hooks
 * Provides smooth 60 FPS hardware-accelerated micro-animations without layout reflow.
 */

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export function useButtonFeedback(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseDown = () => {
      animate(el, {
        scale: 0.96,
        duration: 150,
        ease: 'outCubic',
      });
    };

    const handleMouseUp = () => {
      animate(el, {
        scale: 1.0,
        duration: 200,
        ease: 'outElastic(1, .5)',
      });
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mouseleave', handleMouseUp);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [ref]);
}

export function useCardHoverElevation(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseEnter = () => {
      animate(el, {
        translateY: -3,
        borderColor: '#dfff00',
        duration: 250,
        ease: 'outQuad',
      });
    };

    const handleMouseLeave = () => {
      animate(el, {
        translateY: 0,
        borderColor: '#222222',
        duration: 250,
        ease: 'outQuad',
      });
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);
}
