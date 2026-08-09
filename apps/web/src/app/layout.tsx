import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import OfflineBanner from '@/components/OfflineBanner';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: {
    default: 'WeEverything — One App For Everything',
    template: '%s | WeEverything',
  },
  description:
    'WeEverything is a unified super-app platform for messaging, UPI payments, social moments, workspace collaboration, and mini-apps — all in one place.',
  keywords: ['super app', 'chat', 'social', 'UPI payments', 'wallet', 'productivity', 'mini apps', 'India', 'collaboration', 'workspace'],
  manifest: '/manifest.json',
  metadataBase: new URL('https://weeverything.app'),
  authors: [{ name: 'WeEverything Technologies', url: 'https://weeverything.app' }],
  creator: 'WeEverything Technologies',
  openGraph: {
    title: 'WeEverything — One App For Everything',
    description: 'Messaging, UPI payments, social moments, workspace, and 15+ mini-apps in a single unified super-app.',
    url: 'https://weeverything.app',
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
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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
        {hasClerkKey ? (
          <ClerkProvider appearance={{ baseTheme: dark } as any}>
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
