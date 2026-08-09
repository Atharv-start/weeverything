'use client';

import React, { useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function RegisterPage() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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

        {/* Clerk Auth Component if Clerk publishable key is present */}
        {hasClerkKey ? (
          <div className="flex justify-center">
            <SignUp
              path="/auth/register"
              signInUrl="/auth/login"
              forceRedirectUrl="/home"
              appearance={{
                elements: {
                  formButtonPrimary: 'btn-neon w-full',
                  card: 'bg-transparent shadow-none border-none p-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'btn-glass text-[var(--color-text)]',
                  dividerText: 'text-[var(--color-text-muted)] font-mono text-xs',
                  formFieldLabel: 'text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-wider font-mono',
                  formFieldInput: 'input-neon',
                  footerActionText: 'text-[var(--color-text-muted)] font-mono text-xs',
                  footerActionLink: 'text-[var(--color-primary)] font-mono font-bold hover:underline',
                },
              }}
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
              <label className="text-xs font-bold uppercase font-mono text-[var(--color-text-muted)]">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="secondary" size="lg" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register Account'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
