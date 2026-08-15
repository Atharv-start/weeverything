'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, Suspense } from 'react';
import { ClerkTokenSync } from '@/components/ClerkTokenSync';
import { ThemeProvider } from '@/lib/theme';
import { CookieConsent } from '@/components/CookieConsent';
import { UtmCaptureInner } from '@/components/UtmCapture';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ClerkTokenSync />
        {/* UTM attribution capture — wrapped in Suspense per Next.js requirements */}
        <Suspense fallback={null}>
          <UtmCaptureInner />
        </Suspense>
        {children}
        {/* Cookie consent banner — rendered globally */}
        <CookieConsent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

