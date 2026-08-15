'use client';

import React, { useState, useEffect } from 'react';
import { SignUp, useAuth } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Badge } from '@/components/ui/Badge';

export default function RegisterPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const setTokens = useAuthStore((s) => s.setTokens);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerkKey = typeof clerkKey === 'string' && clerkKey.length > 10 && clerkKey.startsWith('pk_');

  // Auto-redirect to home if user is already signed in via Clerk
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleNativeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ displayName, username, email, password, acceptTerms: true });
      router.push('/home');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest_user_1001',
      email: 'guest@weeverything.app',
      username: 'guest_explorer',
      displayName: 'Guest Explorer',
      role: 'USER',
      status: 'ACTIVE',
    };
    setTokens('demo_guest_access_token', 'demo_guest_refresh_token', guestUser);
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <Card variant="glass" className="w-full max-w-md p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="neon">NEW ACCOUNT</Badge>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">
            Create Your Account
          </h1>
          <p className="text-xs font-mono text-[var(--color-text-muted)]">
            Instant 1-Click Guest Access or Register Account
          </p>
        </div>

        {/* Guest Explorer Priority Button */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[rgba(223,255,0,0.2)] text-center space-y-2.5 glow-neon">
          <p className="text-xs font-mono text-[var(--color-text)] font-semibold">
            Explore WeEverything instantly without signing up:
          </p>
          <Button
            type="button"
            onClick={handleGuestLogin}
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-lg"
          >
            🚀 Continue as Guest Explorer
          </Button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[var(--color-border)] w-full" />
          <span className="bg-[var(--color-surface)] px-3 text-[10px] uppercase font-mono text-[var(--color-text-muted)] absolute">
            OR REGISTER NEW ACCOUNT
          </span>
        </div>

        {/* Clerk Auth Component styled to match dark neon app theme */}
        {hasClerkKey ? (
          <div className="flex justify-center w-full">
            <SignUp
              routing="path"
              path="/auth/register"
              signInUrl="/auth/login"
              fallbackRedirectUrl="/home"
              forceRedirectUrl="/home"
              appearance={
                {
                  baseTheme: dark,
                  variables: {
                    colorBackground: '#0d1117',
                    colorPrimary: '#dfff00',
                    borderRadius: '0.75rem',
                  },
                  elements: {
                    rootBox: 'w-full flex justify-center',
                    cardBox: 'w-full bg-[#0d1117]/90 border border-[rgba(223,255,0,0.2)] rounded-2xl shadow-xl p-2',
                    card: 'bg-transparent shadow-none border-none p-4',
                    headerTitle: 'font-display text-xl font-bold text-white text-center',
                    headerSubtitle: 'text-xs font-mono text-gray-400 text-center',
                    formButtonPrimary: 'btn-neon w-full py-2.5 text-black font-bold font-mono rounded-xl',
                    socialButtonsBlockButton: 'bg-[#161b22] border border-gray-800 hover:bg-gray-800 text-white rounded-xl font-mono text-xs py-2.5 transition-all',
                    socialButtonsBlockButtonText: 'text-white font-mono text-xs font-medium',
                    dividerText: 'text-gray-400 font-mono text-xs',
                    dividerLine: 'bg-gray-800',
                    formFieldLabel: 'text-gray-300 text-xs font-bold uppercase tracking-wider font-mono mb-1',
                    formFieldInput: 'bg-[#161b22] border border-gray-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-[#dfff00] transition-colors',
                    footerActionText: 'text-gray-400 font-mono text-xs',
                    footerActionLink: 'text-[#dfff00] font-mono font-bold hover:underline',
                  },
                } as any
              }
            />
          </div>
        ) : (
          /* Native Registration Fallback */
          <form onSubmit={handleNativeRegister} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase font-mono text-[var(--color-text-muted)]">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase font-mono text-[var(--color-text-muted)]">
                Username
              </label>
              <Input
                type="text"
                placeholder="e.g. alexmorgan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase font-mono text-[var(--color-text-muted)]">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="alex@weeverything.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <PasswordInput
                id="register-password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" variant="secondary" size="lg" className="w-full mt-2" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating Account…
                </span>
              ) : 'Register Account'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
