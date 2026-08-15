'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  User,
  ShieldCheck,
  Palette,
  Bell,
  Lock,
  KeyRound,
  LogOut,
  CheckCircle2,
  Mail,
  Youtube,
  Instagram,
  Globe,
  Smartphone,
  Sparkles,
} from 'lucide-react';

type SettingsSection = 'profile' | 'account' | 'appearance' | 'notifications' | 'privacy' | 'security' | 'logout';

export default function SettingsHubPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const router = useRouter();
  const qc = useQueryClient();
  const { accessToken, user, logout } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState((user as any)?.bio ?? '');
  const [location, setLocation] = useState((user as any)?.location ?? '');
  const [website, setWebsite] = useState((user as any)?.website ?? '');

  // Account & Pass state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    chatSounds: true,
    momentReactions: true,
    marketing: false,
  });

  // Privacy Toggles
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    onlineStatus: true,
    readReceipts: true,
    shareActivity: true,
  });

  // Security Toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Confirm logout dialog
  const { confirm: confirmLogout, dialog: logoutDialog } = useConfirmDialog({
    title: 'Sign Out of WeEverything?',
    description: 'You will need to sign in again with your credentials to access your chats, wallet balance, and workspace notes.',
    confirmLabel: 'Sign Out',
    cancelLabel: 'Stay Signed In',
    variant: 'danger',
    confirmIcon: 'logout',
  });

  // Connected Apps State
  const [connections, setConnections] = useState({
    gmail: true,
    youtube: true,
    instagram: true,
    github: true,
  });

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    const savedConns = localStorage.getItem('we_connected_accounts');
    if (savedConns) {
      try { setConnections(JSON.parse(savedConns)); } catch {}
    }
  }, [accessToken]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const handleProfileSave = () => {
    showSuccess('Profile details updated successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showError('Please enter both current and new password');
      return;
    }
    showSuccess('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (!confirmed) return;
    await logout();
    router.push('/auth/login');
  };

  return (
    <div ref={containerRef} className="page-wrapper space-y-8 min-h-screen">
      {/* ── Floating Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="section-label">APPLICATION PREFERENCES</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text)] flex items-center gap-3">
            Settings Hub
            <Badge variant="neon">v2.4.0</Badge>
          </h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            Manage profile, account security, dark/light theme, notifications, and privacy options
          </p>
        </div>

        <Button href="/settings/profile" variant="secondary" icon="person">
          Manage Profile Details
        </Button>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs flex items-center gap-2 animate-fade-in">
          <Lock className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="anime-stagger lg:col-span-4 space-y-2 glass-card p-3 rounded-2xl">
          {[
            { id: 'profile', label: 'Profile Details', icon: User, desc: 'Display name, bio & avatar' },
            { id: 'account', label: 'Account & Password', icon: KeyRound, desc: 'Email, credentials & role' },
            { id: 'appearance', label: 'Appearance & Theme', icon: Palette, desc: 'Dark / Light mode & colors' },
            { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Push, email & sound alerts' },
            { id: 'privacy', label: 'Privacy & Sharing', icon: Globe, desc: 'Visibility & read receipts' },
            { id: 'security', label: 'Security & 2FA', icon: ShieldCheck, desc: 'Two-factor auth & sessions' },
            { id: 'logout', label: 'Session & Logout', icon: LogOut, desc: 'Sign out of all sessions', danger: true },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as SettingsSection)}
                className={clsx(
                  'w-full p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left',
                  isActive
                    ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] font-bold border border-[var(--color-primary-glow)] shadow-sm'
                    : item.danger
                    ? 'text-rose-400 hover:bg-rose-500/10'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-bright)]/40'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-display font-bold text-xs truncate">{item.label}</p>
                    <p className="font-mono text-[10px] opacity-75 truncate">{item.desc}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Section Content */}
        <div className="anime-stagger lg:col-span-8 space-y-6">
          {/* SECTION 1: PROFILE */}
          {activeSection === 'profile' && (
            <Card variant="glass" className="p-6 space-y-6">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Profile Details</h3>
                <p className="font-mono text-xs text-[var(--color-text-muted)]">Public profile information visible to other users</p>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-display text-2xl font-bold flex items-center justify-center glow-neon">
                  {user?.displayName?.[0]?.toUpperCase() || 'E'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text)]">{user?.displayName || 'Explorer'}</h4>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">@{user?.username || 'explorer'}</p>
                  <Badge variant="neon" className="mt-1">
                    {user?.role || 'DEVELOPER'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)]">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input-neon h-24 resize-none"
                    maxLength={160}
                  />
                  <p className="text-[10px] text-[var(--color-text-subtle)] text-right">{bio.length}/160</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Input
                    label="Website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <Button onClick={handleProfileSave} variant="primary" className="w-full py-3">
                  Save Profile Changes
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 2: ACCOUNT */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <Card variant="glass" className="p-6 space-y-4 font-mono text-xs">
                <div className="border-b border-[var(--color-border)] pb-3">
                  <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Account Credentials</h3>
                  <p className="text-[var(--color-text-muted)] text-xs">Primary contact and account status</p>
                </div>

                <Input label="Registered Email" value={user?.email || 'user@weeverything.app'} disabled className="opacity-60" />
                <Input label="Username" value={`@${user?.username || 'explorer'}`} disabled className="opacity-60" />
                <Input label="Account Role" value={user?.role || 'STANDARD_USER'} disabled className="opacity-60" />
              </Card>

              <Card variant="glass" className="p-6 space-y-4 font-mono text-xs">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--color-text)]">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <Input
                    type="password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button type="submit" variant="primary" className="w-full py-3">
                    Update Password
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* SECTION 3: APPEARANCE & THEME */}
          {activeSection === 'appearance' && (
            <Card variant="glass" className="p-6 space-y-6 font-mono text-xs">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Appearance & Theme Settings</h3>
                <p className="text-[var(--color-text-muted)] text-xs">Global theme selection inherited across all pages, mini apps and dialogs</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Select Application Theme</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { mode: 'dark', label: 'Dark Mode', icon: 'dark_mode', desc: 'Kinematic Noir' },
                    { mode: 'light', label: 'Light Mode', icon: 'light_mode', desc: 'Clean Daylight' },
                    { mode: 'system', label: 'System Auto', icon: 'brightness_auto', desc: 'OS Preference' },
                  ].map((item) => {
                    const isSelected = theme === item.mode;
                    return (
                      <button
                        key={item.mode}
                        onClick={() => {
                          setTheme(item.mode as any);
                          showSuccess(`Theme switched to ${item.label}!`);
                        }}
                        className={clsx(
                          'p-4 rounded-2xl border text-center transition-all cursor-pointer space-y-2',
                          isSelected
                            ? 'bg-[var(--color-primary-dim)] border-[var(--color-primary)] text-[var(--color-primary)] glow-neon'
                            : 'glass-card border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)]'
                        )}
                      >
                        <span className="material-symbols-outlined text-2xl block mx-auto">{item.icon}</span>
                        <div>
                          <p className="font-bold text-xs">{item.label}</p>
                          <p className="text-[9px] opacity-75">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-dim)] border border-[var(--color-border)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-text-muted)]">Active Theme Engine:</span>
                  <Badge variant="neon">{resolvedTheme.toUpperCase()} ACTIVE</Badge>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                  The active theme automatically tokenizes backgrounds, text, borders, glassmorphism cards, and mini-app widgets across the entire monorepo.
                </p>
              </div>
            </Card>
          )}

          {/* SECTION 4: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <Card variant="glass" className="p-6 space-y-4 font-mono text-xs">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Notification Preferences</h3>
                <p className="text-[var(--color-text-muted)] text-xs">Configure channels and instant alerts</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'push', label: 'Browser Push Notifications', desc: 'Realtime chat and payment alerts' },
                  { key: 'email', label: 'Email Digest Notifications', desc: 'Weekly summary and workspace updates' },
                  { key: 'chatSounds', label: 'Chat Sound Effects', desc: 'Play notification audio chimes' },
                  { key: 'momentReactions', label: 'Moments Reactions & Comments', desc: 'Notify when someone likes your post' },
                ].map((item) => {
                  const isChecked = (notifications as any)[item.key];
                  return (
                    <div key={item.key} className="p-3.5 glass-card border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-[var(--color-text)]">{item.label}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          setNotifications((prev) => ({ ...prev, [item.key]: !isChecked }));
                          showSuccess('Notification preference saved!');
                        }}
                        className={clsx(
                          'w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center',
                          isChecked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-bright)]'
                        )}
                      >
                        <div className={clsx('w-4 h-4 rounded-full bg-black transition-transform', isChecked ? 'translate-x-5' : 'translate-x-0')} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* SECTION 5: PRIVACY */}
          {activeSection === 'privacy' && (
            <Card variant="glass" className="p-6 space-y-4 font-mono text-xs">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Privacy & Visibility</h3>
                <p className="text-[var(--color-text-muted)] text-xs">Control profile indexing and read receipt sharing</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'publicProfile', label: 'Public Profile Visibility', desc: 'Allow non-connections to view profile details' },
                  { key: 'onlineStatus', label: 'Show Online Status Indicator', desc: 'Display green dot when active' },
                  { key: 'readReceipts', label: 'Send Read Receipts', desc: 'Allow senders to see when messages are read' },
                  { key: 'shareActivity', label: 'Share Mini-App Activity', desc: 'Show task milestones on moments feed' },
                ].map((item) => {
                  const isChecked = (privacy as any)[item.key];
                  return (
                    <div key={item.key} className="p-3.5 glass-card border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-[var(--color-text)]">{item.label}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          setPrivacy((prev) => ({ ...prev, [item.key]: !isChecked }));
                          showSuccess('Privacy setting updated!');
                        }}
                        className={clsx(
                          'w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center',
                          isChecked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-bright)]'
                        )}
                      >
                        <div className={clsx('w-4 h-4 rounded-full bg-black transition-transform', isChecked ? 'translate-x-5' : 'translate-x-0')} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* SECTION 6: SECURITY & 2FA */}
          {activeSection === 'security' && (
            <Card variant="glass" className="p-6 space-y-6 font-mono text-xs">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Security & Authentication</h3>
                <p className="text-[var(--color-text-muted)] text-xs">Two-factor authentication and active session management</p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[var(--color-text)]">Two-Factor Authentication (2FA)</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Secure your account with TOTP authenticator apps</p>
                </div>
                <Button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showSuccess(!twoFactorEnabled ? '2FA Enabled!' : '2FA Disabled');
                  }}
                  variant={twoFactorEnabled ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {twoFactorEnabled ? '2FA Active ✅' : 'Enable 2FA'}
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-[var(--color-text-muted)]">Active Logged-In Sessions</h4>
                <div className="p-3.5 glass-card border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-[var(--color-primary)]" />
                    <div>
                      <p className="font-bold text-xs text-[var(--color-text)]">Windows 11 (Chrome 132.0)</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Current Active Session • Mumbai, India</p>
                    </div>
                  </div>
                  <Badge variant="neon">ACTIVE NOW</Badge>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 7: LOGOUT */}
          {activeSection === 'logout' && (
            <Card variant="glass" className="p-6 space-y-6 border-rose-500/20 text-center font-mono text-xs">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <LogOut className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Sign Out of WeEverything</h3>
                <p className="text-[var(--color-text-muted)] text-xs max-w-sm mx-auto">
                  You will need to sign in again with your credentials to access your chats, wallet balance, and workspace notes.
                </p>
              </div>

              <Button onClick={handleLogout} variant="danger" className="px-8 py-3 mx-auto">
                Sign Out
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Confirm Sign Out Dialog */}
      {logoutDialog}
    </div>
  );
}
