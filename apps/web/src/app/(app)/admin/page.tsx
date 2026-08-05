'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

type AdminTab = 'dashboard' | 'users' | 'reports';

export default function AdminPage() {
  const { accessToken, user } = useAuthStore();
  const [tab, setTab] = useState<AdminTab>('dashboard');

  useEffect(() => { if (accessToken) setAuthToken(accessToken); }, [accessToken]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR';

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">security</span>
        </div>
        <h2 className="font-display font-bold text-xl text-white">Access Denied</h2>
        <p className="font-mono text-xs text-[#888888] max-w-sm mx-auto">
          Administrative security clearance is required to view this control dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 min-h-screen bg-[#050505] text-[#e5e2e1]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#222222]">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-[#dfff00] tracking-widest block mb-1">
            PLATFORM GOVERNANCE
          </span>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Admin Console</h1>
          <p className="font-body text-xs text-[#888888] mt-0.5">
            System control center · Authenticated as <span className="text-[#dfff00] font-mono font-bold">{user?.role}</span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-[#0F0F0F] p-1 rounded-lg border border-[#222222]">
          {(['dashboard', 'users', 'reports'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2 rounded-md font-mono text-xs uppercase font-bold tracking-wider transition-all',
                tab === t
                  ? 'bg-[#191e00] text-[#dfff00] border border-[#dfff00]/40'
                  : 'text-[#888888] hover:text-white'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data as { totalUsers: number; totalPosts: number; pendingReports: number };
    },
  });

  const stats = [
    { label: 'Total Accounts', value: data?.totalUsers ?? 0, icon: 'group' },
    { label: 'Moments Created', value: data?.totalPosts ?? 0, icon: 'auto_awesome' },
    { label: 'Open Reports', value: data?.pendingReports ?? 0, icon: 'flag' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#0F0F0F] border border-[#222222] rounded-lg p-6 flex items-center justify-between hover:border-[#dfff00] transition-colors">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase font-bold text-[#888888] tracking-widest">{s.label}</p>
              {isLoading ? (
                <div className="h-8 w-24 bg-[#201f1f] rounded animate-pulse" />
              ) : (
                <h3 className="font-display text-3xl font-extrabold text-white tracking-tight">{s.value}</h3>
              )}
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#191e00] border border-[#dfff00]/30 text-[#dfff00] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.data as any[];
    },
  });

  const modMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: string; reason: string }) => {
      const res = await api.put(`/admin/users/${userId}/moderation`, { action, reason });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">User Account Management</h3>
      <div className="bg-[#0F0F0F] border border-[#222222] rounded-lg overflow-hidden">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-[#131313] border-b border-[#222222] text-[#888888] uppercase text-[10px]">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#888888]">Loading user registry...</td>
              </tr>
            ) : users && users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-[#131313] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-display font-bold text-white text-xs">{u.displayName}</p>
                    <p className="font-mono text-[10px] text-[#888888]">@{u.username}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[9px] uppercase font-bold text-[#dfff00] bg-[#191e00] px-2 py-0.5 rounded border border-[#dfff00]/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx('font-mono text-[10px] font-bold', u.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400')}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.status === 'ACTIVE' ? (
                      <button
                        onClick={() => modMutation.mutate({ userId: u.id, action: 'SUSPEND', reason: 'Admin panel moderation' })}
                        className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded text-[10px] font-mono font-bold"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => modMutation.mutate({ userId: u.id, action: 'REACTIVATE', reason: 'Admin panel moderation' })}
                        className="bg-[#191e00] border border-[#dfff00]/30 text-[#dfff00] hover:bg-[#191e00]/80 px-3 py-1 rounded text-[10px] font-mono font-bold"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#888888]">No accounts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsTab() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await api.get('/admin/reports');
      return res.data.data as any[];
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Content Reports</h3>
      <div className="space-y-3">
        {isLoading ? (
          [1, 2].map((i) => <div key={i} className="h-16 bg-[#0F0F0F] border border-[#222222] rounded-lg animate-pulse" />)
        ) : reports && reports.length > 0 ? (
          reports.map((r) => (
            <div key={r.id} className="bg-[#0F0F0F] border border-[#222222] rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-xs text-white">{r.reason}</p>
                <p className="font-mono text-[10px] text-[#888888] mt-0.5">{r.description ?? 'No description provided'}</p>
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#dfff00] bg-[#191e00] px-2 py-1 rounded border border-[#dfff00]/30">
                {r.status}
              </span>
            </div>
          ))
        ) : (
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-lg p-12 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-[#888888]">flag</span>
            <p className="font-display font-bold text-sm text-white">No pending reports</p>
            <p className="font-mono text-xs text-[#888888]">All reported posts have been resolved.</p>
          </div>
        )}
      </div>
    </div>
  );
}
