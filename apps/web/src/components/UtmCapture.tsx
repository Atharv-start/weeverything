'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureUtmParams } from '@/lib/utm';

/**
 * UtmCapture — mounts once in providers to capture UTM params on landing.
 * Wrapped in Suspense by the caller because useSearchParams requires it.
 */
export function UtmCaptureInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUtmParams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount — searchParams are read directly from window.location

  return null;
}
