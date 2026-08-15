'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import clsx from 'clsx';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  confirmIcon?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  confirmIcon,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap + keyboard handling
  useEffect(() => {
    if (!isOpen) { setIsLoading(false); setError(null); return; }

    // Focus cancel button on open
    const t = setTimeout(() => cancelRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (!isLoading) onClose(); return; }
      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = Array.from(
          modal.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); clearTimeout(t); };
  }, [isOpen, isLoading, onClose]);

  const handleConfirm = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  }, [isLoading, onConfirm, onClose]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: confirmIcon ?? 'delete_forever',
      iconBg: 'bg-rose-500/15 text-rose-400',
      confirmBtn: 'bg-rose-500 hover:bg-rose-600 text-white',
    },
    warning: {
      icon: confirmIcon ?? 'warning',
      iconBg: 'bg-amber-500/15 text-amber-400',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-black',
    },
    default: {
      icon: confirmIcon ?? 'help',
      iconBg: 'bg-[var(--color-primary-dim)] text-[var(--color-primary)]',
      confirmBtn: 'btn-neon',
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-sm glass-modal rounded-2xl p-6 space-y-5 animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Icon + Title */}
        <div className="flex items-start gap-4">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', variantConfig.iconBg)}>
            <span className="material-symbols-outlined text-xl">{variantConfig.icon}</span>
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="font-display font-bold text-[var(--color-text)] leading-tight">
              {title}
            </h2>
            {description && (
              <p id="confirm-dialog-desc" className="text-sm text-[var(--color-text-muted)] mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 btn-glass py-2 text-xs disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
            className={clsx(
              'flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:pointer-events-none',
              variantConfig.confirmBtn,
            )}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                {confirmIcon && <span className="material-symbols-outlined text-base">{confirmIcon}</span>}
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hook for imperative usage ────────────────────────────────────────────────

interface UseConfirmDialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  confirmIcon?: string;
}

export function useConfirmDialog(options: UseConfirmDialogOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    resolveRef.current?.(true);
    setIsOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    resolveRef.current?.(false);
    setIsOpen(false);
  }, []);

  const dialog = (
    <ConfirmDialog
      {...options}
      isOpen={isOpen}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );

  return { confirm, dialog };
}
