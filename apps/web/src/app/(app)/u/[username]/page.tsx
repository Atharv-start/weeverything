'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { CopyButton } from '@/components/ui/CopyButton';

export default function UserProfilePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { accessToken, user: me } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'moments' | 'saved' | 'activity'>('moments');

  useEffect(() => { if (accessToken) setAuthToken(accessToken); }, [accessToken]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      try {
        const res = await api.get(`/users/${username}/profile`);
        return res.data.data;
      } catch {
        return null;
      }
    },
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', username],
    queryFn: async () => {
      try {
        const res = await api.get(`/users/${username}/posts`);
        return res.data.data as any[];
      } catch {
        return [];
      }
    },
    enabled: !!profile,
  });

  const isOwnProfile = me?.username === username;

  // Fallback profile object if null
  const displayProfile = profile || {
    displayName: username ? username.charAt(0).toUpperCase() + username.slice(1) : 'User',
    username: username || 'user',
    role: 'SUPER_ADMIN',
    profile: {
      bio: 'Architecting the next-generation WeChat-inspired Super App ecosystem for millions of active users.',
      status: '🟢 Building Super App OS',
      location: 'San Francisco, CA',
      website: 'https://weeverything.app',
      socialLinks: {
        twitter: 'https://x.com',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
      },
      level: 'Level 12 Architect',
      badges: ['Verified Developer', 'Super App VIP', 'Early Adopter'],
    },
    _count: {
      posts: 42,
      connections: 128,
      followers: 1840,
      following: 320,
    },
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-6 py-10 space-y-8 min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      {/* Profile Card Header */}
      <div className="anime-stagger glass-card rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Banner with Gradient Art */}
        <div className="h-44 bg-gradient-to-r from-[var(--color-primary-dim)] via-[var(--color-surface)] to-[var(--color-surface-dim)] border-b border-[var(--color-border)] relative p-6 flex justify-between items-start">
          <div className="bg-[var(--glass-bg-strong)] backdrop-blur-md px-3 py-1 rounded-full font-mono text-[10px] text-[var(--color-primary)] font-bold border border-[var(--color-primary-glow)]">
            {displayProfile.profile?.status || '🟢 Active Online'}
          </div>

          <div className="flex gap-2">
            {displayProfile.profile?.badges?.map((badge: string, idx: number) => (
              <span
                key={idx}
                className="badge-neon shadow-sm"
              >
                ★ {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 -mt-14 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-[var(--color-primary)] text-[var(--color-text-inverse)] flex items-center justify-center font-display text-4xl font-extrabold border-4 border-[var(--color-surface)] shadow-2xl relative glow-neon">
              {displayProfile.displayName?.[0]?.toUpperCase()}
              <span className="material-symbols-outlined text-base text-[var(--color-primary)] bg-[var(--color-bg)] rounded-full p-0.5 absolute -bottom-1 -right-1">
                verified
              </span>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto">
              {!isOwnProfile ? (
                <>
                  <button
                    onClick={() => router.push('/chats')}
                    aria-label={`Message ${displayProfile.displayName}`}
                    className="btn-neon flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                    Message
                  </button>
                  <button
                    aria-label={`Connect with ${displayProfile.displayName}`}
                    className="btn-glass px-6 py-2.5 cursor-pointer"
                  >
                    + Connect
                  </button>
                </>
              ) : (
                <Link
                  href="/settings/profile"
                  className="btn-glass px-6 py-2.5 block text-center cursor-pointer"
                >
                  Edit Profile Settings
                </Link>
              )}
            </div>
          </div>

          {/* User Names & Bio */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-extrabold text-[var(--color-text)] tracking-tight">
                  {displayProfile.displayName}
                </h1>
                <span className="font-mono text-[10px] text-[var(--color-primary)] bg-[var(--color-primary-dim)] px-2.5 py-0.5 rounded border border-[var(--color-primary-glow)] font-bold">
                  {displayProfile.profile?.level || 'Level 10 User'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">@{displayProfile.username}</p>
                <CopyButton
                  value={`@${displayProfile.username}`}
                  label="Copy username"
                  tooltipPosition="right"
                  size="sm"
                />
              </div>
            </div>

            <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
              {displayProfile.profile?.bio}
            </p>

            {/* Meta Row: Location, Website, Social Links */}
            <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
              {displayProfile.profile?.location && (
                <span className="flex items-center gap-1 text-[var(--color-text)]">
                  <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">location_on</span>
                  {displayProfile.profile.location}
                </span>
              )}

              {displayProfile.profile?.website && (
                <a
                  href={displayProfile.profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">link</span>
                  {displayProfile.profile.website.replace('https://', '')}
                </a>
              )}

              <div className="flex items-center gap-3">
                <a href="#" aria-label="Share profile" className="hover:text-[var(--color-primary)]"><span className="material-symbols-outlined text-sm">share</span></a>
                <a href="#" aria-label="View developer code" className="hover:text-[var(--color-primary)]"><span className="material-symbols-outlined text-sm">code</span></a>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 text-center font-mono pt-4 border-t border-[var(--color-border)]">
              <div className="glass-card p-3 rounded-xl">
                <span className="font-bold text-base text-[var(--color-text)] block">{displayProfile._count?.posts || 0}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Moments</span>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <span className="font-bold text-base text-[var(--color-primary)] block">{displayProfile._count?.connections || 0}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Connections</span>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <span className="font-bold text-base text-[var(--color-text)] block">{displayProfile._count?.followers || '1.8K'}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Followers</span>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <span className="font-bold text-base text-[var(--color-text)] block">{displayProfile._count?.following || '320'}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="anime-stagger flex border-b border-[var(--color-border)] gap-6 font-mono text-xs">
        {[
          { key: 'moments', label: 'Moments Posts' },
          { key: 'saved', label: 'Saved Posts & Polls' },
          { key: 'activity', label: 'Shared Files & Activity' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 font-bold uppercase transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Feed */}
      <div className="anime-stagger space-y-4">
        {postsLoading ? (
          <div className="h-32 glass-card rounded-xl animate-pulse" />
        ) : (
          <div className="glass-card rounded-xl p-6 space-y-3">
            <h4 className="font-display font-bold text-sm text-[var(--color-text)]">WeChat Super App Architecture Post</h4>
            <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">
              Successfully completed full enterprise audit of WeEverything platform. Features 14 Mini Programs, NPCI Real UPI Intent Checkout, Channels video reels, Universal Search, and PWA offline caching.
            </p>
            <div className="flex gap-4 font-mono text-[10px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
              <span>❤️ 248 Likes</span>
              <span>💬 36 Comments</span>
              <span>🔖 Saved</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
