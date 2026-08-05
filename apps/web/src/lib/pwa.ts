/**
 * PWA Service Worker Registration & Offline Queue Manager
 */

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered cleanly:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration skipped/failed:', err);
        });
    });
  }
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

class OfflineQueueManager {
  private queue: OfflineAction[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('we_offline_queue');
      if (saved) {
        try {
          this.queue = JSON.parse(saved);
        } catch {
          this.queue = [];
        }
      }
    }
  }

  enqueue(action: Omit<OfflineAction, 'id' | 'timestamp'>): void {
    const item: OfflineAction = {
      ...action,
      id: `act_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };
    this.queue.push(item);
    this.persist();
  }

  getQueue(): OfflineAction[] {
    return this.queue;
  }

  clear(): void {
    this.queue = [];
    this.persist();
  }

  private persist(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('we_offline_queue', JSON.stringify(this.queue));
    }
  }
}

export const offlineQueue = new OfflineQueueManager();
