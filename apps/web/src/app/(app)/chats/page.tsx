'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { AuthModal } from '@/components/ui/AuthModal';

interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name?: string;
  unreadCount?: number;
  isPinned?: boolean;
  online?: boolean;
  typing?: boolean;
  participants: { user: { displayName: string; username: string } }[];
  lastMessage?: { content: string; createdAt: string };
}

export default function ChatsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const { accessToken } = useAuthStore();
  const { requireAuth, authModalOpen, closeAuthModal, protectedActionName } = useAuthGuard();

  const [filterQ, setFilterQ] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatUser, setNewChatUser] = useState('');
  const [localConvos, setLocalConvos] = useState<Conversation[]>([]);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    // Only load user-created conversations — no fake seeds
    const saved = localStorage.getItem('we_chats_convos_v2');
    if (saved) {
      try { setLocalConvos(JSON.parse(saved)); } catch { setLocalConvos([]); }
    } else {
      setLocalConvos([]);
    }
  }, [accessToken]);

  const { data: apiConversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        const res = await api.get('/conversations');
        return (res.data.data as Conversation[]) || [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(accessToken),
  });

  // Use real API data if available, otherwise use locally created ones only
  const conversations = apiConversations.length > 0 ? apiConversations : localConvos;

  const filtered = conversations.filter((c) => {
    const title = c.name || c.participants[0]?.user?.displayName || '';
    return title.toLowerCase().includes(filterQ.toLowerCase());
  });

  const pinned = filtered.filter((c) => c.isPinned);
  const regular = filtered.filter((c) => !c.isPinned);

  const handleCreateNewChat = () => {
    if (!newChatUser.trim()) return;
    const newConvo: Conversation = {
      id: `new-${Date.now()}`,
      type: 'DIRECT',
      isPinned: false,
      online: false,
      participants: [{ user: { displayName: newChatUser.trim(), username: newChatUser.toLowerCase().replace(/\s+/g, '') } }],
      lastMessage: { content: 'Chat started', createdAt: 'Just now' },
    };
    const updated = [newConvo, ...localConvos];
    setLocalConvos(updated);
    localStorage.setItem('we_chats_convos_v2', JSON.stringify(updated));
    setNewChatUser('');
    setShowNewChat(false);
  };

  const ConvoCard = ({ c }: { c: Conversation }) => {
    const title = c.name || c.participants[0]?.user?.displayName || 'Direct Chat';
    return (
      <Link href={`/chats/${c.id}`}>
        <Card variant="interactive" className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                c.isPinned ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] glow-neon' : 'bg-[var(--color-surface-container)] text-[var(--color-text)]'
              }`}>
                {title[0]?.toUpperCase()}
              </div>
              {c.online && (
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--color-surface)] absolute bottom-0 right-0" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-sm truncate text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  {title}
                </h4>
                {c.isPinned && <span className="material-symbols-outlined text-xs text-[var(--color-primary)]">push_pin</span>}
                {c.type === 'GROUP' && (
                  <Badge variant="neon">GROUP</Badge>
                )}
              </div>
              <p className="font-mono text-xs truncate mt-0.5 text-[var(--color-text-muted)]">
                {c.typing
                  ? <span className="italic animate-pulse text-[var(--color-primary)]">typing...</span>
                  : c.lastMessage?.content}
              </p>
            </div>
          </div>

          <span className="font-mono text-[10px] flex-shrink-0 ml-3 text-[var(--color-text-subtle)]">
            {c.lastMessage?.createdAt}
          </span>
        </Card>
      </Link>
    );
  };

  return (
    <div ref={containerRef} className="page-wrapper space-y-8">
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} actionName={protectedActionName} />

      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="section-label">ENCRYPTED MESSAGING</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-3 text-[var(--color-text)]">
            Chats
            <Badge variant="neon">REALTIME</Badge>
          </h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            Direct messages, group channels, WhatsApp quick launcher and media attachments
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => requireAuth(() => setShowNewChat(true), 'start a new conversation')}
            variant="secondary"
            icon="add"
          >
            New Chat
          </Button>
          <Link href="/mini-apps/whatsapp">
            <Button variant="primary" icon="chat">
              WhatsApp Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <Card variant="glass" className="glass-modal p-6 w-full max-w-md space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Start New Chat</h3>
              <button onClick={() => setShowNewChat(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <Input
              type="text"
              value={newChatUser}
              onChange={e => setNewChatUser(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateNewChat()}
              placeholder="Enter name or username..."
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button onClick={() => setShowNewChat(false)} variant="ghost">Cancel</Button>
              <Button onClick={handleCreateNewChat} disabled={!newChatUser.trim()} variant="primary">
                Start Chat
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* WhatsApp Banner */}
      <Card variant="glass" className="anime-stagger p-4 flex items-center justify-between gap-4 font-mono text-xs border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500 text-black">
            <span className="material-symbols-outlined text-xl">chat</span>
          </div>
          <div>
            <h4 className="font-bold text-[var(--color-text)]">Click-to-Chat & WhatsApp Deep Link Launcher</h4>
            <p className="text-[10px] mt-0.5 text-[var(--color-text-muted)]">
              Send direct messages via wa.me without saving contacts
            </p>
          </div>
        </div>
        <Link href="/mini-apps/whatsapp">
          <Button variant="primary" size="sm">Open Launcher</Button>
        </Link>
      </Card>

      {/* Search */}
      <div className="anime-stagger">
        <Input
          icon="search"
          type="text"
          value={filterQ}
          onChange={(e) => setFilterQ(e.target.value)}
          placeholder="Filter conversations..."
        />
      </div>

      {/* Empty State */}
      {conversations.length === 0 && (
        <div className="anime-stagger flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary-dim)] border border-[rgba(223,255,0,0.2)] flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">chat_bubble</span>
          </div>
          <div className="space-y-2 max-w-sm">
            <h2 className="font-display font-bold text-xl text-[var(--color-text)]">No conversations yet</h2>
            <p className="font-body text-sm text-[var(--color-text-muted)]">
              Start your first chat or connect with others through the WhatsApp Hub.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => requireAuth(() => setShowNewChat(true), 'start a conversation')}
              variant="primary"
              icon="add"
            >
              Start a Conversation
            </Button>
            <Link href="/mini-apps/whatsapp">
              <Button variant="secondary" icon="chat">WhatsApp Hub</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="anime-stagger space-y-3">
          <span className="font-mono text-[10px] uppercase font-bold flex items-center gap-1 text-[var(--color-primary)]">
            <span className="material-symbols-outlined text-sm">push_pin</span> Pinned Chats ({pinned.length})
          </span>
          <div className="space-y-2">
            {pinned.map((c) => <ConvoCard key={c.id} c={c} />)}
          </div>
        </div>
      )}

      {/* Regular */}
      {regular.length > 0 && (
        <div className="anime-stagger space-y-3">
          <span className="font-mono text-[10px] uppercase font-bold flex items-center gap-1 text-[var(--color-text-muted)]">
            <span className="material-symbols-outlined text-sm">chat</span> Conversations ({regular.length})
          </span>
          <div className="space-y-2">
            {regular.map((c) => <ConvoCard key={c.id} c={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
