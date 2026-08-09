'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { Tooltip } from '@/components/ui/Tooltip';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '🚀', '💯'];

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { accessToken, user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
  }, [accessToken]);

  const { data: convData } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const res = await api.get(`/conversations/${conversationId}`);
      return res.data.data;
    },
  });

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await api.get(`/conversations/${conversationId}/messages?limit=50`);
      return res.data.data as any[];
    },
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/conversations/${conversationId}/messages`, { content });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
      setAttachment(null);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const otherMembers = convData?.members?.filter((m: any) => m.user?.id !== user?.id) ?? [];
  const chatName = convData?.type === 'GROUP' ? convData.name : otherMembers[0]?.user?.displayName;
  const isGroup = convData?.type === 'GROUP';

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() && !attachment) return;
    
    let content = message;
    if (attachment) {
      content += `\n[Attachment: ${attachment.name}]`;
    }
    
    setMessage('');
    setShowEmojiPicker(false);
    await sendMutation.mutateAsync(content);
  }

  const handleSelectEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const triggerSimulatedAttachment = () => {
    setAttachment({
      name: `Photo_${Math.floor(Math.random() * 900) + 100}.jpg`,
      size: '1.2 MB'
    });
  };

  const getFilteredMessages = () => {
    if (!messagesData) return [];
    if (!searchQuery.trim()) return messagesData;
    return messagesData.filter((m: any) =>
      m.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredMessages = getFilteredMessages();

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#e5e2e1] overflow-hidden">
      {/* Top Bar Header */}
      <header className="px-6 py-4 bg-[#0e0e0e] border-b border-[#222222] flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Tooltip content="Back to all conversations">
            <Link
              href="/chats"
              aria-label="Back to chats"
              className="w-9 h-9 rounded-lg bg-[#0F0F0F] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white hover:border-[#dfff00] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>
          </Tooltip>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-[#222222] text-[#dfff00] flex items-center justify-center font-mono font-bold text-sm">
              {(chatName ?? 'C')?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-sm text-white">{chatName ?? 'Loading chat...'}</h1>
                {isGroup && (
                  <span className="font-mono text-[9px] uppercase font-bold text-[#dfff00] bg-[#191e00] px-1.5 py-0.5 rounded border border-[#dfff00]/30">
                    GROUP
                  </span>
                )}
              </div>
              <p className="font-mono text-[10px] text-[#888888]">
                {isGroup ? `${convData?.members?.length ?? 0} members` : 'Online & Active'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="Search messages in chat">
            <button
              onClick={() => setShowSearchBox(!showSearchBox)}
              aria-label="Search conversation"
              className="w-9 h-9 rounded-lg bg-[#0F0F0F] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white hover:border-[#dfff00] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
          </Tooltip>
          <Tooltip content="Toggle chat info drawer">
            <button
              onClick={() => setShowDetailsDrawer(!showDetailsDrawer)}
              aria-label="Chat details"
              className="w-9 h-9 rounded-lg bg-[#0F0F0F] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white hover:border-[#dfff00] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">info</span>
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Optional Search Bar */}
      {showSearchBox && (
        <div className="px-6 py-3 bg-[#0F0F0F] border-b border-[#222222] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#888888] text-base">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs font-mono text-white placeholder-[#888888] outline-none"
            placeholder="Search messages in conversation..."
            autoFocus
          />
          <button onClick={() => { setSearchQuery(''); setShowSearchBox(false); }} className="text-[#888888] hover:text-white">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Main Messages & Side Drawer Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 hide-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="font-mono text-xs text-[#888888] animate-pulse">Loading channel messages...</span>
            </div>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((msg: any) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={clsx('flex flex-col max-w-[75%]', isMine ? 'ml-auto items-end' : 'mr-auto items-start')}
                >
                  <span className="font-mono text-[9px] text-[#888888] mb-1 px-1">
                    {msg.sender?.displayName ?? 'User'} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                  <div
                    className={clsx(
                      'px-4 py-3 rounded-lg text-xs font-body leading-relaxed max-w-full break-words border',
                      isMine
                        ? 'bg-[#191e00] text-[#dfff00] border-[#dfff00]/30 font-medium'
                        : 'bg-[#0F0F0F] text-[#e5e2e1] border-[#222222]'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-2 text-center text-[#888888]">
              <span className="material-symbols-outlined text-3xl">chat</span>
              <p className="font-mono text-xs">No messages found in this channel.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Info Drawer */}
        {showDetailsDrawer && (
          <aside className="w-72 bg-[#0e0e0e] border-l border-[#222222] p-6 space-y-6 overflow-y-auto hide-scrollbar z-10">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <h3 className="font-display font-bold text-xs uppercase text-white tracking-wider">Channel Specs</h3>
              <button onClick={() => setShowDetailsDrawer(false)} className="text-[#888888] hover:text-white">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#201f1f] border border-[#222222] text-[#dfff00] flex items-center justify-center font-mono font-bold text-xl mx-auto">
                {(chatName ?? 'C')?.[0]?.toUpperCase()}
              </div>
              <h4 className="font-display font-bold text-sm text-white">{chatName}</h4>
              <p className="font-mono text-[10px] text-[#888888]">{convData?.type} CHANNEL</p>
            </div>

            {isGroup && (
              <div className="space-y-3 pt-4 border-t border-[#222222]">
                <h5 className="font-mono text-[10px] uppercase font-bold text-[#dfff00] tracking-widest">
                  MEMBERS ({convData?.members?.length ?? 0})
                </h5>
                <div className="space-y-2">
                  {convData?.members?.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 p-2 bg-[#0F0F0F] rounded-lg border border-[#222222]">
                      <div className="w-7 h-7 rounded-full bg-[#201f1f] text-white flex items-center justify-center font-mono text-xs font-bold">
                        {m.user?.displayName?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-xs text-white truncate">{m.user?.displayName}</p>
                        <p className="font-mono text-[9px] text-[#888888]">@{m.user?.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Composer Input Bar */}
      <footer className="p-4 bg-[#0e0e0e] border-t border-[#222222] relative z-10">
        {/* Simulated Attachment Badge */}
        {attachment && (
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-[#191e00] border border-[#dfff00]/40 rounded text-xs font-mono text-[#dfff00]">
            <span className="material-symbols-outlined text-sm">attach_file</span>
            <span>{attachment.name} ({attachment.size})</span>
            <button onClick={() => setAttachment(null)} className="hover:text-white ml-1">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 bg-[#0F0F0F] border border-[#222222] p-3 rounded-lg flex gap-2 shadow-2xl z-20">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelectEmoji(emoji)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3">
          <Tooltip content="Attach image or document">
            <button
              type="button"
              onClick={triggerSimulatedAttachment}
              aria-label="Attach file"
              className="w-10 h-10 rounded-lg bg-[#0F0F0F] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white hover:border-[#dfff00] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">attach_file</span>
            </button>
          </Tooltip>

          <Tooltip content="Add emoji reaction">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Emoji picker"
              className="w-10 h-10 rounded-lg bg-[#0F0F0F] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white hover:border-[#dfff00] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">mood</span>
            </button>
          </Tooltip>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="TYPE MESSAGE OR /COMMAND..."
            className="flex-1 bg-[#0F0F0F] border border-[#222222] rounded-lg px-4 py-2.5 text-xs font-mono text-white placeholder-[#888888] focus:border-[#dfff00] outline-none transition-colors"
          />

          <Tooltip content="Send message">
            <button
              type="submit"
              disabled={sendMutation.isPending || (!message.trim() && !attachment)}
              aria-label="Send message"
              className="bg-[#dfff00] text-[#050505] px-5 py-2.5 rounded-lg font-mono text-xs uppercase font-bold tracking-wider hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>SEND</span>
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </Tooltip>
        </form>
      </footer>
    </div>
  );
}
