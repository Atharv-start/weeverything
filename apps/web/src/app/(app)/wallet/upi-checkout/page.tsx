'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useAnimeStagger } from '@/lib/anime';
import { api } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { AuthModal } from '@/components/ui/AuthModal';
import { CopyButton } from '@/components/ui/CopyButton';

type PaymentState = 'INIT' | 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';

export default function UpiCheckoutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const { requireAuth, authModalOpen, closeAuthModal, protectedActionName } = useAuthGuard();

  const [vpa, setVpa] = useState('merchant.weeverything@upi');
  const [payeeName, setPayeeName] = useState('WeEverything Super App');
  const [amount, setAmount] = useState('500.00');
  const [note, setNote] = useState('Wallet Topup');
  const [paymentState, setPaymentState] = useState<PaymentState>('INIT');

  const [providerOrderId, setProviderOrderId] = useState('');
  const [provider, setProvider] = useState('SANDBOX');
  const [upiIntentUri, setUpiIntentUri] = useState('');
  const [qrPayload, setQrPayload] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Status Polling Effect
  useEffect(() => {
    if (!providerOrderId || (paymentState !== 'INITIATED' && paymentState !== 'PENDING')) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/wallet/payment/status/${providerOrderId}`);
        const status = res.data.data?.status;
        if (status === 'SUCCESS') {
          setPaymentState('SUCCESS');
          clearInterval(interval);
        } else if (status === 'FAILED') {
          setPaymentState('FAILED');
          clearInterval(interval);
        }
      } catch (e) {
        // Continue polling silently
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [providerOrderId, paymentState]);

  const handleCreateAndLaunchPayment = () => {
    requireAuth(async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const amountPaise = Math.round(parseFloat(amount) * 100);
        if (isNaN(amountPaise) || amountPaise <= 0) {
          throw new Error('Please enter a valid amount');
        }

        const idempKey = `idemp_${Date.now()}`;
        const res = await api.post('/wallet/payment/create-order', {
          amount: amountPaise,
          description: note.trim() || undefined,
          upiVpa: vpa.trim() || undefined,
          idempotencyKey: idempKey,
        });

        const data = res.data.data;
        setProviderOrderId(data.providerOrderId);
        setProvider(data.provider);
        setUpiIntentUri(data.upiIntentUri);
        setQrPayload(data.qrPayload || data.upiIntentUri);
        setIdempotencyKey(idempKey);
        setPaymentState('PENDING');

        // Trigger native UPI intent protocol for mobile apps
        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
          window.location.href = data.upiIntentUri;
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to create payment order');
        setPaymentState('FAILED');
      } finally {
        setIsLoading(false);
      }
    }, 'execute UPI payments');
  };

  // Helper for developer/sandbox environment verification test
  const handleVerifySandboxPayment = async () => {
    if (!providerOrderId) return;
    try {
      await api.post('/wallet/payment/verify', {
        providerOrderId,
        providerPaymentId: `pay_sb_${Date.now()}`,
      });
      setPaymentState('SUCCESS');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-6 py-10 space-y-8 min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} actionName={protectedActionName} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/wallet" aria-label="Back to Wallet" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </Link>
            <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-primary)] tracking-widest block">
              REAL UPI PAYMENT GATEWAY
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            NPCI Real UPI Intent Checkout
          </h1>
          <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">
            Razorpay / Cashfree / Sandbox Server-Verified Webhook Engine
          </p>
        </div>
      </div>

      <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* UPI Checkout Form */}
        <div className="glass-card rounded-2xl p-6 space-y-4 shadow-2xl">
          <h3 className="font-display font-bold text-base text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
            UPI Intent Payment Config
          </h3>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-mono">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label htmlFor="upi-vpa" className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block mb-1">Payee UPI VPA</label>
              <input
                id="upi-vpa"
                type="text"
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                className="w-full input-neon"
                disabled={paymentState === 'PENDING' || paymentState === 'SUCCESS'}
              />
            </div>

            <div>
              <label htmlFor="upi-payee" className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block mb-1">Payee Name</label>
              <input
                id="upi-payee"
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                className="w-full input-neon"
                disabled
              />
            </div>

            <div>
              <label htmlFor="upi-amount" className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block mb-1">Amount (INR ₹)</label>
              <input
                id="upi-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full input-neon font-bold text-sm text-[var(--color-primary)]"
                disabled={paymentState === 'PENDING' || paymentState === 'SUCCESS'}
              />
            </div>

            <div>
              <label htmlFor="upi-note" className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block mb-1">Note / Transaction Ref</label>
              <input
                id="upi-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full input-neon"
                disabled={paymentState === 'PENDING' || paymentState === 'SUCCESS'}
              />
            </div>

            <button
              onClick={handleCreateAndLaunchPayment}
              disabled={isLoading || paymentState === 'PENDING' || paymentState === 'SUCCESS'}
              className="btn-neon w-full py-3.5 flex items-center justify-center gap-2 text-xs shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
              {isLoading ? 'Creating Order...' : 'Launch UPI App Intent (PhonePe / GPay / Paytm)'}
            </button>
          </div>
        </div>

        {/* Dynamic QR & Payment Status State Machine */}
        <div className="glass-card rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-[var(--color-text)] border-b border-[var(--color-border)] pb-3 flex justify-between items-center">
              <span>Dynamic UPI QR & Status</span>
              <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold">{provider}</span>
            </h3>

            <div className="pt-4 text-center space-y-4">
              <div className="bg-white p-5 rounded-2xl inline-block shadow-2xl">
                <QRCodeSVG value={qrPayload || upiIntentUri || 'upi://pay?pa=merchant@upi&pn=WeEverything&am=500&cu=INR'} size={180} />
              </div>
              <p className="font-mono text-[10px] text-[var(--color-text-muted)]">Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)</p>
            </div>
          </div>

          {/* Payment State Display */}
          <div className="space-y-3 font-mono text-xs border-t border-[var(--color-border)] pt-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-muted)]">Transaction Status:</span>
              <span className={`font-bold px-3 py-1 rounded text-[10px] uppercase ${
                paymentState === 'SUCCESS'
                  ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[var(--color-primary-glow)]'
                  : paymentState === 'PENDING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}>
                {paymentState === 'PENDING' ? 'AWAITING PROVIDER CONFIRMATION...' : paymentState}
              </span>
            </div>

            {providerOrderId && (
              <>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[var(--color-text-muted)]">Provider Order ID:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--color-text)] font-bold">{providerOrderId}</span>
                    <CopyButton value={providerOrderId} label="Copy Order ID" size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[var(--color-text-muted)]">Idempotency Key:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--color-primary)]">{idempotencyKey}</span>
                    <CopyButton value={idempotencyKey} label="Copy Key" size="sm" />
                  </div>
                </div>

                {provider === 'SANDBOX' && paymentState === 'PENDING' && (
                  <button
                    onClick={handleVerifySandboxPayment}
                    className="w-full py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase rounded-lg hover:bg-amber-500/30 cursor-pointer"
                  >
                    Simulate Webhook Success (Sandbox Test)
                  </button>
                )}

                {paymentState === 'SUCCESS' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 text-[11px] text-emerald-400">
                    <p className="font-bold">✓ Payment Confirmed & Ledger Credited!</p>
                    <p className="text-[10px] text-emerald-300/80">Funds added to your double-entry wallet ledger.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
