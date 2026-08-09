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
          const token = await getToken();
          if (!active) return;
          if (token) {
            setAuthToken(token);
            // Fetch local SQLite user details to sync store
            const res = await api.get('/auth/me');
            if (active && res.data?.data?.user) {
              // Set the access token and user record in Zustand store
              setTokens(token, '', res.data.data.user);
            }
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
