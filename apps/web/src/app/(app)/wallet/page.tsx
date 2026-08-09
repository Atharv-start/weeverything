'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { AuthModal } from '@/components/ui/AuthModal';

type Tab = 'overview' | 'send' | 'request' | 'upi';



export default function WalletPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const { accessToken } = useAuthStore();
  const { requireAuth, authModalOpen, closeAuthModal, protectedActionName } = useAuthGuard();

  const [tab, setTab] = useState<Tab>('overview');
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendDesc, setSendDesc] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const qc = useQueryClient();

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
  }, [accessToken]);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      try {
        const res = await api.get('/wallet');
        return res.data.data as { walletId: string; balance: number; formattedBalance: string; currency: string; isActive: boolean };
      } catch {
        return { walletId: 'w-default', balance: 0, formattedBalance: '₹0.00', currency: 'INR', isActive: true };
      }
    },
  });

  const { data: historyData, isLoading: histLoading } = useQuery({
    queryKey: ['wallet-history'],
    queryFn: async () => {
      try {
        const res = await api.get('/wallet/history');
        return res.data.data as any[];
      } catch {
        return [];
      }
    },
  });

  const transferMutation = useMutation({
    mutationFn: async () => {
      const amount = Math.round(parseFloat(sendAmount) * 100);
      if (isNaN(amount) || amount <= 0) throw new Error('Enter a valid amount');
      const res = await api.post('/wallet/transfer', {
        toUserId: sendTo.trim(),
        amount,
        description: sendDesc || undefined,
        idempotencyKey: `web_${Date.now()}`,
      });
      return res.data.data;
    },
    onSuccess: () => {
      setSuccess('Transfer completed successfully!');
      setSendTo(''); setSendAmount(''); setSendDesc('');
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-history'] });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (e: any) => { setError(e.message || 'Transfer failed'); setTimeout(() => setError(''), 4000); },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      const amount = Math.round(parseFloat(sendAmount) * 100);
      if (isNaN(amount) || amount <= 0) throw new Error('Enter a valid amount');
      const res = await api.post('/wallet/payment-request', {
        toUserId: sendTo.trim(),
        amount,
        description: sendDesc || undefined,
      });
      return res.data.data;
    },
    onSuccess: () => {
      setSuccess('Payment request successfully sent!');
      setSendTo(''); setSendAmount(''); setSendDesc('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (e: any) => { setError(e.message || 'Request failed'); setTimeout(() => setError(''), 4000); },
  });

  const handleUpiPay = () => {
    requireAuth(async () => {
      if (!sendAmount) {
        setError('Please enter a valid amount');
        setTimeout(() => setError(''), 4000);
        return;
      }
      try {
        const amountPaise = Math.round(parseFloat(sendAmount) * 100);
        const res = await api.post('/wallet/payment/create-order', {
          amount: amountPaise,
          upiVpa: upiVpa.trim() || undefined,
          description: sendDesc.trim() || undefined,
        });

        setSuccess('Payment order created! Redirecting to UPI intent checkout...');
        setTimeout(() => {
          window.location.href = `/wallet/upi-checkout?orderId=${res.data.data.providerOrderId}`;
        }, 1000);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to create payment order');
        setTimeout(() => setError(''), 4000);
      }
    }, 'execute UPI payments');
  };

  const displayHistory = historyData ?? [];

  return (
    <div ref={containerRef} className="page-wrapper space-y-8">
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} actionName={protectedActionName} />

      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="section-label">FINANCIAL ENGINE & UPI GATEWAY</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Wallet Ledger & UPI
          </h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            UPI quick pay, double-entry ledger & peer-to-peer transfers
          </p>
        </div>

        <div className="flex gap-2">
          <Button href="/mini-apps/utilities" variant="secondary" icon="qr_code_scanner">
            QR Scanner
          </Button>
        </div>
      </div>

      {/* Balance Hero Card */}
      <Card variant="glass" className="anime-stagger p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 glow-neon">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">
            AVAILABLE LEDGER BALANCE
          </p>
          {walletLoading ? (
            <Skeleton variant="text" className="h-10 w-48" />
          ) : (
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-[var(--color-primary)]">
              {wallet?.formattedBalance ?? '—'}
            </h2>
          )}
          <p className="font-mono text-[10px] flex items-center gap-1.5 pt-1 text-[var(--color-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] glow-neon" />
            LEDGER STATUS: ACTIVE & SECURED
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setTab('upi')}
            variant="primary"
            icon="send_to_mobile"
          >
            UPI Direct Pay
          </Button>
          <Button
            onClick={() => setTab('send')}
            variant="secondary"
            icon="send"
          >
            Transfer Cash
          </Button>
        </div>
      </Card>

      {/* Quick Services Grid */}
      <div className="anime-stagger grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Mobile Recharge', icon: 'phone_iphone' },
          { label: 'Electricity Bill', icon: 'bolt' },
          { label: 'DTH / Cable', icon: 'tv' },
          { label: 'Credit Card Bill', icon: 'credit_card' },
        ].map((serv, i) => (
          <Card
            key={i}
            variant="interactive"
            onClick={() => {
              setTab('upi');
              setSendDesc(serv.label);
            }}
            className="p-4 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-xl text-[var(--color-primary)]">{serv.icon}</span>
            <span className="font-mono text-xs font-bold text-[var(--color-text)]">{serv.label}</span>
          </Card>
        ))}
      </div>

      {/* Action Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'send', label: 'P2P Transfer' },
          { key: 'request', label: 'Payment Request' },
          { key: 'upi', label: 'UPI Direct Pay' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={clsx(
              'px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex-shrink-0 cursor-pointer border',
              tab === t.key ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm' : 'glass-card border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Forms */}
      {tab === 'send' && (
        <Card variant="glass" className="anime-stagger p-6 space-y-4 max-w-lg">
          <h3 className="font-display font-bold text-sm uppercase text-[var(--color-text)]">P2P Wallet Transfer</h3>
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-mono">{error}</div>}
          {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-mono">{success}</div>}

          <Input
            placeholder="Recipient User ID or @username..."
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount in INR (e.g. 500)..."
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
          />
          <Input
            placeholder="Optional Note / Description..."
            value={sendDesc}
            onChange={(e) => setSendDesc(e.target.value)}
          />

          <Button
            onClick={() => requireAuth(() => transferMutation.mutate(), 'transfer money')}
            isLoading={transferMutation.isPending}
            variant="primary"
            className="w-full py-3"
          >
            Confirm & Transfer
          </Button>
        </Card>
      )}

      {tab === 'upi' && (
        <Card variant="glass" className="anime-stagger p-6 space-y-4 max-w-lg">
          <h3 className="font-display font-bold text-sm uppercase text-[var(--color-text)]">UPI Intent Protocol Direct Pay</h3>
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-mono">{error}</div>}
          {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-mono">{success}</div>}

          <Input
            placeholder="Virtual Payment Address (e.g. user@okaxis / user@ybl)..."
            value={upiVpa}
            onChange={(e) => setUpiVpa(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount in INR (e.g. 250)..."
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
          />

          <Button
            onClick={handleUpiPay}
            variant="primary"
            className="w-full py-3"
          >
            Launch UPI App (GPay / PhonePe / Paytm)
          </Button>
        </Card>
      )}

      {/* Transaction History */}
      <Card variant="glass" className="anime-stagger p-6 space-y-4">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--color-text)]">Recent Ledger Transactions</h3>

        {histLoading ? (
          <div className="space-y-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : displayHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-[var(--color-text-muted)]">receipt_long</span>
            <div>
              <p className="font-mono text-xs font-bold text-[var(--color-text-muted)]">No transactions yet</p>
              <p className="font-body text-xs text-[var(--color-text-subtle)] mt-1">Your transaction history will appear here after your first transfer.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayHistory.map((tx: any) => (
              <div key={tx.id} className="p-4 rounded-xl flex items-center justify-between bg-[var(--color-surface-container)] border border-[var(--color-border)] font-mono text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    tx.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-text)]">{tx.description || 'Ledger Entry'}</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-[var(--color-text)]'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'} ₹{(tx.amount / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
