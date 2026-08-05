import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAuthToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  status: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { displayName: string; username: string; email: string; password: string; acceptTerms: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setTokens(accessToken, refreshToken, user) {
        setAuthToken(accessToken);
        set({ user, accessToken, refreshToken });
      },

      clearAuth() {
        setAuthToken(null);
        set({ user: null, accessToken: null, refreshToken: null });
      },

      async login(identifier, password) {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { identifier, password });
          const { user, accessToken, refreshToken } = res.data.data;
          get().setTokens(accessToken, refreshToken, user);
        } finally {
          set({ isLoading: false });
        }
      },

      async register(data) {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          const { user, accessToken, refreshToken } = res.data.data;
          get().setTokens(accessToken, refreshToken, user);
        } finally {
          set({ isLoading: false });
        }
      },

      async logout() {
        const { refreshToken, clearAuth } = get();
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch {
          // Ignore errors on logout
        } finally {
          clearAuth();
        }
      },

      async refreshSession(): Promise<boolean> {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const res = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          setAuthToken(accessToken);
          set({ accessToken, refreshToken: newRefreshToken });
          return true;
        } catch {
          get().clearAuth();
          return false;
        }
      },
    }),
    {
      name: 'we-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
