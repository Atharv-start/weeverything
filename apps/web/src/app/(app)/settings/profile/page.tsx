'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react';
import { Camera, Save, LogOut, Mail, Youtube, Instagram, AlertCircle, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

type SettingsTab = 'profile' | 'integrations';

interface ConnectionState {
  gmail: boolean;
  calendar: boolean;
  youtube: boolean;
  instagram: boolean;
  linkedin: boolean;
  twitter: boolean;
  github: boolean;
}

export default function SettingsProfilePage() {
  const { accessToken, user, logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Persistent Connected Accounts state
  const [connections, setConnections] = useState<ConnectionState>({
    gmail: true,
    calendar: true,
    youtube: true,
    instagram: true,
    linkedin: true,
    twitter: true,
    github: true,
  });

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    const saved = localStorage.getItem('we_connected_accounts');
    if (saved) {
      try {
        setConnections(JSON.parse(saved));
      } catch {
        // default true
      }
    }
  }, [accessToken]);

  const saveConnections = (updated: ConnectionState) => {
    setConnections(updated);
    localStorage.setItem('we_connected_accounts', JSON.stringify(updated));
  };

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await api.get(`/users/${user?.username}/profile`);
      return res.data.data;
    },
    enabled: !!user?.username,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setBio(profile.profile?.bio ?? '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/users/profile', { displayName, bio });
      return res.data.data;
    },
    onSuccess: () => {
      setSuccess('Profile updated successfully!');
      qc.invalidateQueries({ queryKey: ['my-profile'] });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (e: any) => {
      setError(e.message);
      setTimeout(() => setError(''), 4000);
    },
  });

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const toggleConnection = (service: keyof ConnectionState) => {
    const updated = {
      ...connections,
      [service]: !connections[service],
    };
    saveConnections(updated);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 font-mono text-xs text-[var(--color-text)]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--color-border)] pb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-text)] tracking-tight">Account Settings & Integrations</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Configure profile details and OAuth connected social accounts</p>
        </div>

        {/* Settings Tab Selectors */}
        <div className="flex gap-1 p-1 rounded-xl glass-card border border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('profile')}
            className={clsx(
              'px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-150 cursor-pointer',
              activeTab === 'profile' ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.3)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            Profile details
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={clsx(
              'px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-150 cursor-pointer',
              activeTab === 'integrations' ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.3)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            Connected Apps ({Object.values(connections).filter(Boolean).length})
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6">
          {/* Profile Photo */}
          <Card variant="glass" className="p-6">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Profile Photo</p>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] flex items-center justify-center font-bold text-2xl glow-neon">
                  {user?.displayName?.[0]?.toUpperCase()}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] flex items-center justify-center transition-all cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--color-text)]">{user?.displayName}</p>
                <p className="text-xs text-[var(--color-text-muted)]">@{user?.username}</p>
                <Badge variant="neon" className="mt-1">
                  {user?.role || 'SYSTEM ARCHITECT'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Edit Fields Form */}
          <Card variant="glass" className="p-6 space-y-4">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--color-border)]">Edit Profile Info</p>

            {success && <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">{success}</div>}
            {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <div className="space-y-4">
              <Input
                id="profile-displayname"
                label="Display name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="input-neon h-24 resize-none"
                  placeholder="Tell people about yourself…"
                  maxLength={160}
                />
                <p className="text-[10px] text-[var(--color-text-muted)] text-right mt-1">{bio.length}/160</p>
              </div>

              <Input
                label="Registered Email"
                value={user?.email ?? ''}
                disabled
                className="opacity-60 cursor-not-allowed"
              />

              <Input
                label="Username"
                value={`@${user?.username ?? ''}`}
                disabled
                className="opacity-60 cursor-not-allowed"
              />

              <Button
                id="save-profile-btn"
                onClick={() => updateMutation.mutate()}
                isLoading={updateMutation.isPending}
                variant="primary"
                className="w-full py-3"
              >
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card variant="glass" className="p-6 border-rose-500/20">
            <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">Session management</p>
            <Button
              id="settings-logout"
              onClick={handleLogout}
              variant="danger"
              className="w-full py-3"
            >
              <LogOut className="w-4 h-4" /> Sign out of WeEverything
            </Button>
          </Card>
        </div>
      ) : (
        /* CONNECTED SOCIAL ACCOUNTS TAB */
        <div className="space-y-6">
          <div className="bg-[var(--color-primary-dim)] border border-[rgba(223,255,0,0.3)] rounded-xl p-5 text-xs text-[var(--color-primary)] flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold uppercase text-[10px]">OAuth Social Integration Layer Active</p>
              <p className="text-[var(--color-text)] text-[11px]">
                Connected accounts allow 1-tap post sharing, imported avatar profiles, and direct protocol launching for Instagram, LinkedIn, YouTube, X (Twitter), and GitHub.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Google Workspace */}
            <Card variant="glass" className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">Google Workspace & Gmail</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Gmail, Calendar, Drive & Meet APIs</p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleConnection('gmail')}
                  variant={connections.gmail ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {connections.gmail ? 'Connected' : 'Connect'}
                </Button>
              </div>
            </Card>

            {/* YouTube */}
            <Card variant="glass" className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex items-center justify-center flex-shrink-0">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">YouTube Channel</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Embedded playback & channel videos</p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleConnection('youtube')}
                  variant={connections.youtube ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {connections.youtube ? 'Connected' : 'Connect'}
                </Button>
              </div>
            </Card>

            {/* Instagram */}
            <Card variant="glass" className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">Instagram Profile</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Reels & post deep link integration</p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleConnection('instagram')}
                  variant={connections.instagram ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {connections.instagram ? 'Connected' : 'Connect'}
                </Button>
              </div>
            </Card>

            {/* LinkedIn */}
            <Card variant="glass" className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">LinkedIn Professional</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Professional network & posts sync</p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleConnection('linkedin')}
                  variant={connections.linkedin ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {connections.linkedin ? 'Connected' : 'Connect'}
                </Button>
              </div>
            </Card>

            {/* X (Twitter) */}
            <Card variant="glass" className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">X (Twitter) Feed</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Tweet sharing & handle verification</p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleConnection('twitter')}
                  variant={connections.twitter ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {connections.twitter ? 'Connected' : 'Connect'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
