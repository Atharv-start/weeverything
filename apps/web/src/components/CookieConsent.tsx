'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

type ConsentState = 'accepted' | 'rejected' | 'managed' | null;
type ConsentPreferences = { necessary: true; analytics: boolean; personalization: boolean };

const CONSENT_KEY = 'we_cookie_consent';
const PREFS_KEY = 'we_cookie_prefs';

function getStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === 'accepted' || v === 'rejected' || v === 'managed') return v;
  return null;
}

function saveConsent(state: ConsentState, prefs?: ConsentPreferences) {
  if (!state) return;
  localStorage.setItem(CONSENT_KEY, state);
  if (prefs) localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent === 'accepted') return { necessary: true, analytics: true, personalization: true };
  if (consent === 'rejected') return { necessary: true, analytics: false, personalization: false };
  if (consent === 'managed') {
    try {
      const p = localStorage.getItem(PREFS_KEY);
      if (p) return JSON.parse(p) as ConsentPreferences;
    } catch {}
  }
  return null;
}

export function hasAnalyticsConsent(): boolean {
  const p = getConsentPreferences();
  return p?.analytics === true;
}

// ─── Preferences Modal ───────────────────────────────────────────────────────

interface PrefsModalProps {
  prefs: ConsentPreferences;
  onSave: (prefs: ConsentPreferences) => void;
  onClose: () => void;
}

function PreferencesModal({ prefs, onSave, onClose }: PrefsModalProps) {
  const [local, setLocal] = useState<ConsentPreferences>(prefs);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    closeRef.current?.focus();
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, input, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggle = (key: 'analytics' | 'personalization') => {
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md glass-modal rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 id="cookie-prefs-title" className="font-display font-bold text-lg text-[var(--color-text)]">
            Cookie Preferences
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close preferences"
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-bright)] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Necessary — always on */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[var(--color-surface-container)]">
            <div>
              <p className="font-semibold text-[var(--color-text)]">Necessary</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Required for the app to function (auth, session, security). Cannot be disabled.
              </p>
            </div>
            <div
              role="checkbox"
              aria-checked="true"
              aria-label="Necessary cookies always on"
              className="w-10 h-5 rounded-full bg-[var(--color-primary)] flex-shrink-0 flex items-center justify-end pr-0.5 cursor-not-allowed opacity-60"
            >
              <span className="w-4 h-4 rounded-full bg-white" />
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[var(--color-surface-container)]">
            <div>
              <p className="font-semibold text-[var(--color-text)]">Analytics</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Helps us understand how you use WeEverything to improve the experience.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={local.analytics}
              aria-label="Toggle analytics cookies"
              onClick={() => toggle('analytics')}
              className={clsx(
                'w-10 h-5 rounded-full flex-shrink-0 flex items-center transition-colors duration-200 cursor-pointer',
                local.analytics
                  ? 'bg-[var(--color-primary)] justify-end pr-0.5'
                  : 'bg-[var(--color-surface-bright)] border border-[var(--color-border)] justify-start pl-0.5',
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>

          {/* Personalization */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[var(--color-surface-container)]">
            <div>
              <p className="font-semibold text-[var(--color-text)]">Personalization</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Enables AI-powered recommendations and personalized content.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={local.personalization}
              aria-label="Toggle personalization cookies"
              onClick={() => toggle('personalization')}
              className={clsx(
                'w-10 h-5 rounded-full flex-shrink-0 flex items-center transition-colors duration-200 cursor-pointer',
                local.personalization
                  ? 'bg-[var(--color-primary)] justify-end pr-0.5'
                  : 'bg-[var(--color-surface-bright)] border border-[var(--color-border)] justify-start pl-0.5',
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 btn-glass py-2 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(local)}
            className="flex-1 btn-neon py-2 text-xs"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Banner ──────────────────────────────────────────────────────────────

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>('accepted'); // optimistic default — avoid flash
  const [showPrefs, setShowPrefs] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Only show after hydration
    const stored = getStoredConsent();
    setConsent(stored);
  }, []);

  useEffect(() => {
    if (consent === null) {
      const t = setTimeout(() => acceptRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [consent]);

  const handleAccept = useCallback(() => {
    const state: ConsentState = 'accepted';
    saveConsent(state, { necessary: true, analytics: true, personalization: true });
    setConsent(state);
  }, []);

  const handleReject = useCallback(() => {
    const state: ConsentState = 'rejected';
    saveConsent(state, { necessary: true, analytics: false, personalization: false });
    setConsent(state);
  }, []);

  const handleSavePrefs = useCallback((prefs: ConsentPreferences) => {
    const state: ConsentState = 'managed';
    saveConsent(state, prefs);
    setConsent(state);
    setShowPrefs(false);
  }, []);

  // Don't render if decision already made
  if (consent !== null) return null;

  return (
    <>
      {showPrefs && (
        <PreferencesModal
          prefs={{ necessary: true, analytics: true, personalization: true }}
          onSave={handleSavePrefs}
          onClose={() => setShowPrefs(false)}
        />
      )}

      {/* Banner */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Cookie consent"
        aria-live="polite"
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-[9998]',
          'lg:bottom-6 lg:left-6 lg:right-auto lg:max-w-md',
          'glass-modal rounded-t-2xl lg:rounded-2xl p-5',
          'border-t border-[var(--color-border)] lg:border animate-in slide-in-from-bottom-4 duration-300',
        )}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-lg">cookie</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-[var(--color-text)] leading-tight">
              We use cookies & local storage
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
              We use necessary cookies for authentication and security, plus optional analytics to improve WeEverything.
              See our{' '}
              <Link href="/privacy" className="text-[var(--color-primary)] hover:underline focus:underline outline-none">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/cookies" className="text-[var(--color-primary)] hover:underline focus:underline outline-none">
                Cookie Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            ref={acceptRef}
            onClick={handleAccept}
            className="btn-neon py-2 text-xs flex-1"
          >
            Accept All
          </button>
          <button
            onClick={handleReject}
            className="btn-glass py-2 text-xs flex-1"
          >
            Reject Non-Essential
          </button>
          <button
            onClick={() => setShowPrefs(true)}
            className="py-2 px-4 text-xs font-mono font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
            aria-label="Manage cookie preferences"
          >
            Manage
          </button>
        </div>
      </div>
    </>
  );
}
