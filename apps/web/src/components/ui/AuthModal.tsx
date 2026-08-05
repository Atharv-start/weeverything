'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
}

export function AuthModal({ isOpen, onClose, actionName = 'perform this action' }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <Card variant="glass" className="glass-modal p-6 w-full max-w-md space-y-5 animate-scale-in text-center">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.3)] flex items-center justify-center mx-auto glow-neon">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>

        <div className="space-y-2">
          <Badge variant="neon">
            AUTHENTICATION REQUIRED
          </Badge>
          <h3 className="font-display font-bold text-xl text-[var(--color-text)]">
            Sign In to {actionName}
          </h3>
          <p className="font-mono text-xs text-[var(--color-text-muted)] leading-relaxed max-w-xs mx-auto">
            You are browsing as a guest. Please sign in or register your account to continue.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Button href="/auth/login" variant="primary" size="lg" className="w-full">
            Sign In to Account
          </Button>
          <Button href="/auth/register" variant="secondary" size="lg" className="w-full">
            Create New Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
