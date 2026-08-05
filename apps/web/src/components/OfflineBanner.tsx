'use client';

import { useState, useEffect } from 'react';
import { offlineQueue } from '@/lib/pwa';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setIsOffline(true);
      setQueuedCount(offlineQueue.getQueue().length);
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-black px-4 py-2 text-xs font-mono font-bold flex items-center justify-between z-50 fixed top-0 inset-x-0 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-base animate-pulse">wifi_off</span>
        <span>YOU ARE OFFLINE - WE-OS CACHE MODE ACTIVE ({queuedCount} ACTIONS QUEUED)</span>
      </div>
      <button
        onClick={() => {
          if (navigator.onLine) {
            setIsOffline(false);
          } else {
            alert('Still offline. Actions will automatically sync when network reconnects.');
          }
        }}
        className="bg-black text-white px-3 py-1 rounded text-[10px] uppercase hover:bg-neutral-800"
      >
        Retry Network
      </button>
    </div>
  );
}
