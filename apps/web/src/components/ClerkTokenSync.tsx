'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { api, setAuthToken } from '@/lib/api';

export function ClerkTokenSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { setTokens, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) return;

    let active = true;

    async function sync() {
      if (isSignedIn && clerkUser) {
        try {
          const token = (await getToken()) || 'clerk_session_active';
          if (!active) return;
          setAuthToken(token);

          // Construct authenticated user record directly from Clerk profile
          const clerkAuthUser = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || `${clerkUser.id}@clerk.user`,
            username:
              clerkUser.username ||
              clerkUser.firstName?.toLowerCase() ||
              clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] ||
              'user',
            displayName: clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Authenticated User',
            role: 'USER',
            status: 'ACTIVE',
          };

          // Update store immediately with Clerk user state
          setTokens(token, '', clerkAuthUser);

          // Optionally enrich with backend database record if available
          try {
            const res = await api.get('/auth/me');
            if (active && res.data?.data?.user) {
              setTokens(token, '', res.data.data.user);
            }
          } catch {
            // Keep Clerk profile state if custom API is unreachable or sync endpoint is pending
          }
        } catch (err) {
          console.error('Failed to sync Clerk token', err);
        }
      }
    }

    sync();

    // Refresh token periodically every 2 minutes to keep authorization fresh
    const interval = setInterval(sync, 2 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isLoaded, isSignedIn, clerkUser]);

  return null;
}
