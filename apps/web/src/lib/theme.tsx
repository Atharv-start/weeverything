'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeClasses(mode: ThemeMode): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'dark';
  const root = document.documentElement;

  let resolved: 'dark' | 'light' = 'dark';

  if (mode === 'light') {
    resolved = 'light';
    root.classList.add('light');
    root.classList.remove('dark');
  } else if (mode === 'dark') {
    resolved = 'dark';
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    resolved = prefersDark ? 'dark' : 'light';
    if (prefersDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('we_theme') as ThemeMode) || 'dark';
    setThemeState(saved);
    const active = applyThemeClasses(saved);
    setResolvedTheme(active);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const current = (localStorage.getItem('we_theme') as ThemeMode) || 'system';
      if (current === 'system') {
        const res = applyThemeClasses('system');
        setResolvedTheme(res);
      }
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('we_theme', mode);
    const active = applyThemeClasses(mode);
    setResolvedTheme(active);
  }, []);

  const cycleTheme = useCallback(() => {
    const order: ThemeMode[] = ['dark', 'light', 'system'];
    const nextMode = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(nextMode);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
