'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

export default function WhatsAppHubPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [recentChats] = useState([
    { name: 'Alex Rivera', phone: '+14155552671', lastMsg: 'Sent draft presentation slides', time: '10:42 AM', online: true },
    { name: 'Priya Sharma', phone: '+919876543210', lastMsg: 'Confirmed meeting at 3 PM', time: 'Yesterday', online: false },
    { name: 'David Kim', phone: '+821012345678', lastMsg: 'Shared project repository link', time: 'Jul 21', online: true },
    { name: 'Tech Core Group', phone: '+18005550199', lastMsg: 'Build deployment v2.4 released', time: 'Jul 20', online: true },
  ]);

  const [activeTab, setActiveTab] = useState<'quick' | 'contacts' | 'share'>('quick');
  const [shareText, setShareText] = useState('Check out WeEverything Super App: https://weeverything.app');
  const [copiedStatus, setCopiedStatus] = useState(false);

  const openClickToChat = (targetPhone?: string, targetMsg?: string) => {
    const num = (targetPhone || phoneNumber).replace(/[^0-9]/g, '');
    const text = encodeURIComponent(targetMsg || message);
    if (!num) {
      alert('Please enter a valid phone number with country code');
      return;
    }
    const waUrl = `https://wa.me/${num}?text=${text}`;
    window.open(waUrl, '_blank');
  };

  const openWhatsAppNative = () => {
    window.location.href = 'whatsapp://';
    setTimeout(() => {
      window.open('https://web.whatsapp.com', '_blank');
    }, 1500);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="COMMUNICATION BRIDGE"
        title="WhatsApp Integration Hub"
        description="Click-to-chat, deep linking, native launcher, contact sync, and quick message broadcast"
        actions={
          <button
            onClick={openWhatsAppNative}
            className="bg-[#25D366] text-[#050505] px-5 py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#25D366]/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Open WhatsApp App
          </button>
        }
      />

      {/* Quick Launch Banner */}
      <div className="anime-stagger glass-card border border-[#25D366]/30 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="font-mono text-[9px] uppercase font-bold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded border border-[#25D366]/30">
            DIRECT PROTOCOL LAUNCHER
          </span>
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Start Chat Without Saving Contact</h3>
          <p className="font-body text-xs text-[var(--color-text-muted)]">
            Instantly connect on WhatsApp web or mobile app using standard wa.me API protocols.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => window.open('https://web.whatsapp.com', '_blank')}
            className="flex-1 md:flex-none border border-[var(--color-border)] bg-[var(--color-surface-dim)] hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] px-4 py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all cursor-pointer"
          >
            Launch WhatsApp Web
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4">
        {[
          { key: 'quick', label: 'Click to Chat', icon: 'chat' },
          { key: 'contacts', label: 'Synced Contacts', icon: 'contacts' },
          { key: 'share', label: 'Share to WhatsApp', icon: 'share' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/40'
                : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Click to Chat */}
      {activeTab === 'quick' && (
        <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Direct Message Composer</h3>

            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Phone Number (with Country Code)</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +919876543210 or 14155552671"
                className="w-full input-neon focus:border-[#25D366]"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Pre-filled Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full input-neon h-28 resize-none focus:border-[#25D366]"
              />
            </div>

            <button
              onClick={() => openClickToChat()}
              className="w-full bg-[#25D366] text-[#050505] py-3 rounded-xl font-mono text-xs uppercase font-bold tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Launch WhatsApp Chat
            </button>
          </div>

          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Recent WhatsApp Direct Links</h3>
            <div className="space-y-3">
              {recentChats.map((chat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex items-center justify-between hover:border-[#25D366]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] font-bold font-mono text-sm flex items-center justify-center">
                        {chat.name[0]}
                      </div>
                      {chat.online && <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] absolute bottom-0 right-0 border-2 border-[var(--color-bg)]" />}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-[var(--color-text)]">{chat.name}</h4>
                      <p className="font-mono text-[10px] text-[var(--color-text-muted)]">{chat.phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => openClickToChat(chat.phone, 'Hello, following up from WeEverything Super App')}
                    className="p-2 text-[#25D366] bg-[#25D366]/10 rounded-lg hover:bg-[#25D366] hover:text-[#050505] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">chat</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Synced Contacts */}
      {activeTab === 'contacts' && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Import & Sync WhatsApp Contacts</h3>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">Import address book entries directly into WeEverything OS</p>
            </div>
            <button className="btn-glass border border-[var(--color-border)] hover:border-[#25D366] px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold cursor-pointer">
              + Import Address Book
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {recentChats.map((c, i) => (
              <div key={i} className="p-4 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-[var(--color-text)]">{c.name}</h4>
                  <p className="font-mono text-xs text-[#25D366] mt-0.5">{c.phone}</p>
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)] mt-1">{c.lastMsg}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openClickToChat(c.phone, '')}
                    className="px-3 py-1.5 bg-[#25D366] text-[#050505] rounded-lg font-mono text-[10px] font-bold uppercase hover:brightness-110 cursor-pointer"
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Share to WhatsApp */}
      {activeTab === 'share' && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--color-text)]">Share Content & Media to WhatsApp</h3>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Broadcast Payload / Text</label>
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              className="w-full input-neon h-24 resize-none focus:border-[#25D366]"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank')}
              className="bg-[#25D366] text-[#050505] px-6 py-3 rounded-xl font-mono text-xs uppercase font-bold hover:brightness-110 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Share via WhatsApp Web / App
            </button>
            <button
              onClick={copyShareLink}
              className="btn-glass border border-[var(--color-border)] hover:border-[#25D366] px-6 py-3 rounded-xl font-mono text-xs uppercase font-bold flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">{copiedStatus ? 'check' : 'content_copy'}</span>
              {copiedStatus ? 'Copied to Clipboard!' : 'Copy Link Payload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
