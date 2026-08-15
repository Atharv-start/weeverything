import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import OfflineBanner from '@/components/OfflineBanner';
import ErrorBoundary from '@/components/ErrorBoundary';

const SITE_URL = 'https://weeverything-web-chi.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'WeEverything — One App For Everything',
    template: '%s | WeEverything',
  },
  description:
    'WeEverything is a unified super-app platform for messaging, UPI payments, social moments, workspace collaboration, and mini-apps — all in one place.',
  keywords: ['super app', 'chat', 'social', 'UPI payments', 'wallet', 'productivity', 'mini apps', 'India', 'collaboration', 'workspace'],
  manifest: '/manifest.json',
  metadataBase: new URL(SITE_URL),
  authors: [{ name: 'WeEverything Technologies', url: SITE_URL }],
  creator: 'WeEverything Technologies',
  alternates: {
    canonical: '/',
  },
  // Google Search Console verification — set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel env
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
  openGraph: {
    title: 'WeEverything — One App For Everything',
    description: 'Messaging, UPI payments, social moments, workspace, and 15+ mini-apps in a single unified super-app.',
    url: SITE_URL,
    siteName: 'WeEverything',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeEverything — One App For Everything',
    description: 'Messaging, UPI payments, social moments, workspace, and 15+ mini-apps in a single unified super-app.',
    creator: '@weeverything',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerkKey = typeof clerkKey === 'string' && clerkKey.length > 10 && clerkKey.startsWith('pk_');

  const content = (
    <Providers>
      <OfflineBanner />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Providers>
  );

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300 font-body selection:bg-[var(--color-primary-dim)] selection:text-[var(--color-primary)]" suppressHydrationWarning>
        {/* Global skip-to-content for auth/public pages */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[var(--color-primary)] focus:text-[var(--color-text-inverse)] focus:font-mono focus:text-xs focus:font-bold focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        {hasClerkKey ? (
          <ClerkProvider publishableKey={clerkKey} appearance={{ baseTheme: dark } as any}>
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
