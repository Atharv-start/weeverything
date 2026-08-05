'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

export default function GoogleSuitePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [activeTab, setActiveTab] = useState<'calendar' | 'meet' | 'gmail' | 'drive' | 'maps'>('calendar');

  // Calendar & Meet State
  const [events, setEvents] = useState([
    { id: '1', title: 'Super App Production Release Review', time: '10:00 AM - 11:30 AM', location: 'Google Meet (meet.google.com/abc-defg-hij)', date: 'Today', meetLink: 'https://meet.google.com/abc-defg-hij' },
    { id: '2', title: 'Architecture Sync w/ Core Devs', time: '02:00 PM - 03:00 PM', location: 'Conference Room B', date: 'Today', meetLink: 'https://meet.google.com/xyz-uvwx-rst' },
    { id: '3', title: 'Q3 Product Roadmap Planning', time: '11:00 AM - 12:00 PM', location: 'Virtual', date: 'Tomorrow', meetLink: 'https://meet.google.com/mno-pqrs-tuv' },
  ]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvTime, setNewEvTime] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Meet Instant Link Generator State
  const [generatedMeetLink, setGeneratedMeetLink] = useState('');

  // Gmail State
  const [emails] = useState([
    { id: '1', from: 'Google Workspace', subject: 'Security alert: New login detected', snippet: 'Your account was accessed from a new device in Mumbai...', time: '9:45 AM', read: false, label: 'Primary' },
    { id: '2', from: 'Stripe Billing', subject: 'Invoice #2026-9041 Paid', snippet: 'Thank you for your payment to WeEverything Inc...', time: 'Yesterday', read: true, label: 'Updates' },
    { id: '3', from: 'Clerk Authentication', subject: 'OAuth production credentials verified', snippet: 'Your production domain mapping has completed successfully...', time: 'Jul 21', read: true, label: 'Important' },
  ]);
  const [showCompose, setShowCompose] = useState(false);
  const [mailTo, setMailTo] = useState('');
  const [mailSub, setMailSub] = useState('');
  const [mailBody, setMailBody] = useState('');

  // Drive State
  const [files, setFiles] = useState([
    { name: 'Architecture_Diagram_v2.pdf', size: '4.2 MB', updated: '2 hours ago', type: 'pdf' },
    { name: 'Financial_Projections_2026.xlsx', size: '1.8 MB', updated: 'Yesterday', type: 'sheet' },
    { name: 'WeEverything_Brand_Assets.zip', size: '48.5 MB', updated: 'Jul 20', type: 'zip' },
  ]);
  const [uploadFileName, setUploadFileName] = useState('');

  // Maps State
  const [mapQuery, setMapQuery] = useState('Mumbai Financial Hub');

  const createInstantMeet = () => {
    const code = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    const link = `https://meet.google.com/${code}`;
    setGeneratedMeetLink(link);
  };

  const handleSaveEvent = () => {
    if (!newEvTitle.trim()) return;
    if (editingEventId) {
      setEvents(
        events.map((ev) =>
          ev.id === editingEventId ? { ...ev, title: newEvTitle, time: newEvTime || ev.time } : ev
        )
      );
      setEditingEventId(null);
    } else {
      setEvents([
        ...events,
        {
          id: Date.now().toString(),
          title: newEvTitle,
          time: newEvTime || '03:00 PM - 04:00 PM',
          location: 'Google Meet',
          date: 'Today',
          meetLink: 'https://meet.google.com/new',
        },
      ]);
    }
    setShowEventModal(false);
    setNewEvTitle('');
    setNewEvTime('');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((ev) => ev.id !== id));
  };

  const handleUploadFile = () => {
    if (!uploadFileName.trim()) return;
    setFiles([
      { name: uploadFileName.trim(), size: '2.4 MB', updated: 'Just now', type: 'doc' },
      ...files,
    ]);
    setUploadFileName('');
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="GOOGLE WORKSPACE ECOSYSTEM"
        title="Google Workspace Integration"
        description="Google Calendar, Meet, Gmail inbox, Drive files & Maps synced inside WeEverything OS"
      />

      {/* Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'calendar', label: 'Calendar', icon: 'calendar_month' },
          { key: 'meet', label: 'Google Meet', icon: 'video_call' },
          { key: 'gmail', label: 'Gmail Inbox', icon: 'mail' },
          { key: 'drive', label: 'Google Drive', icon: 'cloud' },
          { key: 'maps', label: 'Google Maps', icon: 'map' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/40 shadow-sm'
                : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Google Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="anime-stagger flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Upcoming Calendar Schedule</h3>
            <button
              onClick={() => {
                setEditingEventId(null);
                setNewEvTitle('');
                setNewEvTime('');
                setShowEventModal(true);
              }}
              className="bg-[#4285F4] text-white px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase hover:brightness-110 cursor-pointer"
            >
              + Create Event
            </button>
          </div>

          {showEventModal && (
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-3 font-mono text-xs">
              <h4 className="font-bold text-[var(--color-text)] text-sm">{editingEventId ? 'Edit Event' : 'Schedule New Event'}</h4>
              <input
                type="text"
                placeholder="Event Title..."
                value={newEvTitle}
                onChange={(e) => setNewEvTitle(e.target.value)}
                className="input-neon"
              />
              <input
                type="text"
                placeholder="Time (e.g. 04:00 PM - 05:00 PM)..."
                value={newEvTime}
                onChange={(e) => setNewEvTime(e.target.value)}
                className="input-neon"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowEventModal(false)} className="btn-glass text-xs">Cancel</button>
                <button
                  onClick={handleSaveEvent}
                  className="bg-[#4285F4] text-white px-4 py-1.5 rounded-lg font-bold uppercase cursor-pointer"
                >
                  Save Event
                </button>
              </div>
            </div>
          )}

          <div className="anime-stagger space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 glass-card border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase text-[#4285F4] font-bold">{ev.date} • {ev.time}</span>
                  <h4 className="font-display font-bold text-sm text-[var(--color-text)] mt-0.5">{ev.title}</h4>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">{ev.location}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingEventId(ev.id);
                      setNewEvTitle(ev.title);
                      setNewEvTime(ev.time);
                      setShowEventModal(true);
                    }}
                    className="p-1.5 glass-card text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg border border-[var(--color-border)] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-1.5 glass-card text-red-400 hover:text-red-300 rounded-lg border border-[var(--color-border)] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                  <a
                    href={ev.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#4285F4] text-white border border-transparent rounded-lg font-mono text-[10px] uppercase font-bold cursor-pointer"
                  >
                    Join Meet ➔
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Google Meet */}
      {activeTab === 'meet' && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-[#00832d]">video_call</span>
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Google Meet Video Conferencing</h3>
                <p className="font-mono text-xs text-[var(--color-text-muted)]">Create instant links, schedule calls & sync with Calendar</p>
              </div>
            </div>

            <button
              onClick={createInstantMeet}
              className="bg-[#00832d] text-white px-5 py-2.5 rounded-xl font-mono text-xs uppercase font-bold hover:brightness-110 shadow-lg cursor-pointer"
            >
              + Create Instant Meeting Link
            </button>
          </div>

          {generatedMeetLink && (
            <div className="p-4 bg-[var(--color-surface-dim)] border border-[#00832d]/40 rounded-xl flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#00832d] font-bold uppercase">INSTANT MEETING CREATED</span>
                <p className="text-[var(--color-text)] font-bold">{generatedMeetLink}</p>
              </div>
              <a
                href={generatedMeetLink}
                target="_blank"
                rel="noreferrer"
                className="bg-[#00832d] text-white px-4 py-2 rounded-lg font-bold uppercase cursor-pointer"
              >
                Join Now
              </a>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h4 className="font-display font-bold text-xs uppercase text-[var(--color-text)]">Upcoming Video Meetings</h4>
            {events.map((ev) => (
              <div key={ev.id} className="p-4 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex justify-between items-center font-mono text-xs">
                <div>
                  <h5 className="font-bold text-[var(--color-text)] text-sm">{ev.title}</h5>
                  <p className="text-[var(--color-text-muted)] text-[10px]">{ev.time}</p>
                </div>
                <a href={ev.meetLink} target="_blank" rel="noreferrer" className="bg-[#00832d] text-white px-4 py-1.5 rounded-lg font-bold cursor-pointer">
                  Join Call
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Gmail */}
      {activeTab === 'gmail' && (
        <div className="space-y-6">
          <div className="anime-stagger flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Gmail Inbox Stream</h3>
            <button
              onClick={() => setShowCompose(true)}
              className="bg-[#EA4335] text-white px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase hover:brightness-110 cursor-pointer"
            >
              + Compose Email
            </button>
          </div>

          {showCompose && (
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-3 font-mono text-xs">
              <input
                type="email"
                placeholder="Recipient Email (to)..."
                value={mailTo}
                onChange={(e) => setMailTo(e.target.value)}
                className="input-neon"
              />
              <input
                type="text"
                placeholder="Subject..."
                value={mailSub}
                onChange={(e) => setMailSub(e.target.value)}
                className="input-neon"
              />
              <textarea
                placeholder="Compose mail body..."
                value={mailBody}
                onChange={(e) => setMailBody(e.target.value)}
                className="input-neon h-24 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCompose(false)} className="btn-glass text-xs cursor-pointer">Cancel</button>
                <button
                  onClick={() => {
                    window.open(`mailto:${mailTo}?subject=${encodeURIComponent(mailSub)}&body=${encodeURIComponent(mailBody)}`, '_blank');
                    setShowCompose(false);
                  }}
                  className="bg-[#EA4335] text-white px-4 py-1.5 rounded-lg font-bold uppercase cursor-pointer"
                >
                  Send Mail
                </button>
              </div>
            </div>
          )}

          <div className="anime-stagger space-y-3">
            {emails.map((m) => (
              <div key={m.id} className="p-4 glass-card border border-[var(--color-border)] rounded-xl flex items-center justify-between hover:border-[#EA4335]/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs text-[var(--color-text)]">{m.from}</span>
                    {!m.read && <span className="w-2 h-2 rounded-full bg-[#EA4335]" />}
                  </div>
                  <h4 className="font-body text-xs font-bold text-[var(--color-text)] mt-1">{m.subject}</h4>
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)] truncate max-w-md">{m.snippet}</p>
                </div>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{m.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Drive */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          <div className="anime-stagger flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Google Drive Cloud Files</h3>
            <button
              onClick={() => window.open('https://drive.google.com', '_blank')}
              className="bg-[#34A853] text-white px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase hover:brightness-110 cursor-pointer"
            >
              Open Google Drive
            </button>
          </div>

          <div className="flex gap-2 font-mono text-xs">
            <input
              type="text"
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
              placeholder="Add new document name..."
              className="flex-1 input-neon"
            />
            <button
              onClick={handleUploadFile}
              className="bg-[#34A853] text-white px-4 py-2 rounded-xl font-bold uppercase cursor-pointer"
            >
              + Upload File
            </button>
          </div>

          <div className="anime-stagger grid grid-cols-1 md:grid-cols-3 gap-4">
            {files.map((f, i) => (
              <div key={i} className="p-4 glass-card border border-[var(--color-border)] rounded-xl space-y-3 hover:border-[#34A853]/40 transition-colors">
                <span className="material-symbols-outlined text-3xl text-[#34A853]">description</span>
                <div>
                  <h4 className="font-display font-bold text-xs text-[var(--color-text)] truncate">{f.name}</h4>
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)] mt-0.5">{f.size} • {f.updated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Maps */}
      {activeTab === 'maps' && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--color-text)]">Google Maps Search & Navigation</h3>

          <div className="flex gap-2 font-mono text-xs">
            <input
              type="text"
              value={mapQuery}
              onChange={(e) => setMapQuery(e.target.value)}
              placeholder="Search location, restaurant or city..."
              className="flex-1 input-neon"
            />
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, '_blank')}
              className="bg-[#FBBC05] text-[#050505] px-6 py-2.5 rounded-xl font-mono text-xs uppercase font-bold cursor-pointer"
            >
              Search Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
