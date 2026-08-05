'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

type NotificationCategory = 'all' | 'connections' | 'payments' | 'system';



export default function NotificationsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const { accessToken } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const qc = useQueryClient();

  useEffect(() => { if (accessToken) setAuthToken(accessToken); }, [accessToken]);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await api.get('/notifications');
        return res.data.data as any[];
      } catch {
        return [];
      }
    },
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: async () => api.post('/notifications/mark-all-read'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const displayList = notificationsData ?? [];

  const getFilteredNotifications = () => {
    let result = [...displayList];

    if (activeCategory === 'connections') {
      result = result.filter(n => n.type?.includes('CONNECTION'));
    } else if (activeCategory === 'payments') {
      result = result.filter(n => n.type?.includes('PAYMENT') || n.type?.includes('TRANSFER'));
    } else if (activeCategory === 'system') {
      result = result.filter(n => !n.type?.includes('CONNECTION') && !n.type?.includes('PAYMENT') && !n.type?.includes('TRANSFER'));
    }

    return result;
  };

  const filteredNotifications = getFilteredNotifications();
  const unread = displayList.filter((n: any) => !n.isRead).length;

  return (
    <div ref={containerRef} className="page-wrapper space-y-8">
      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="section-label">EVENT LOGS & ALERTS</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text)]">Notifications</h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            {unread > 0 ? `You have ${unread} unread activity logs` : 'All activity notifications are read'}
          </p>
        </div>

        {unread > 0 && (
          <Button
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
            variant="secondary"
            icon="done_all"
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Category Pills */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'all', label: 'All Notifications' },
          { key: 'connections', label: 'Social & Messages' },
          { key: 'payments', label: 'Fintech & UPI' },
          { key: 'system', label: 'System & Engine' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key as NotificationCategory)}
            className={clsx(
              'px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex-shrink-0 cursor-pointer border',
              activeCategory === tab.key ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm' : 'glass-card border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary-dim)] border border-[rgba(223,255,0,0.2)] flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">notifications</span>
          </div>
          <div className="space-y-2 max-w-xs">
            <h2 className="font-display font-bold text-xl text-[var(--color-text)]">You're all caught up</h2>
            <p className="font-body text-sm text-[var(--color-text-muted)]">
              No new notifications. When someone interacts with you, it will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n: any) => (
            <Card
              key={n.id}
              variant="glass"
              className={clsx(
                'anime-stagger p-4 flex items-start justify-between gap-4 transition-all',
                !n.isRead && 'border-l-4 border-l-[var(--color-primary)] bg-[var(--color-primary-dim)]/20'
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] flex items-center justify-center flex-shrink-0 glow-neon">
                  <span className="material-symbols-outlined text-xl">
                    {n.type?.includes('PAYMENT') ? 'account_balance_wallet' : n.type?.includes('CONNECTION') ? 'chat' : 'notifications'}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-sm text-[var(--color-text)]">{n.title}</h4>
                  <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{n.body}</p>
                  <span className="font-mono text-[10px] text-[var(--color-text-subtle)] mt-1 block">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <Button
                  onClick={() => markReadMutation.mutate(n.id)}
                  variant="ghost"
                  size="sm"
                >
                  Mark read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
