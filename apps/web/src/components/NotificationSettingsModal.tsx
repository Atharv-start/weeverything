'use client';

import { useState } from 'react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState({
    pushSocial: true,
    pushPayments: true,
    pushSystem: true,
    pushMiniApps: false,
    emailDigest: true,
    smsAlerts: true,
  });

  if (!isOpen) return null;

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-modal rounded-2xl p-6 w-full max-w-md space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h3 className="font-display font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[var(--color-primary)]">tune</span>
            Notification Preferences
          </h3>
          <button onClick={onClose} aria-label="Close notification preferences" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {[
            { key: 'pushSocial', label: 'Push: Social Likes & Comments' },
            { key: 'pushPayments', label: 'Push: Payment & Transfer Alerts' },
            { key: 'pushSystem', label: 'Push: System Security & Logins' },
            { key: 'pushMiniApps', label: 'Push: Mini App Program Alerts' },
            { key: 'emailDigest', label: 'Email: Daily Activity Digest' },
            { key: 'smsAlerts', label: 'SMS: Urgent Security OTPs' },
          ].map((item) => {
            const isChecked = settings[item.key as keyof typeof settings];
            return (
              <div key={item.key} className="flex items-center justify-between p-3.5 glass-card border border-[var(--color-border)] rounded-xl">
                <span className="text-[var(--color-text)] font-medium">{item.label}</span>
                <button
                  onClick={() => toggle(item.key as any)}
                  aria-label={`Toggle ${item.label}`}
                  className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${isChecked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-bright)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-[var(--color-border)]">
          <button
            onClick={() => {
              alert('Notification preferences updated successfully!');
              onClose();
            }}
            className="btn-neon px-6 py-2.5 cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
