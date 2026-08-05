'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'work' | 'personal' | 'ideas' | 'sticky';
  color?: string;
  pinned: boolean;
  date: string;
}

export default function NotesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Super App Pre-Deployment Checklist',
      content: '1. Verified UPI & NPCI Payment Flow\n2. Built Indian App Launchers Matrix\n3. Integrated Everyday Phone Utilities\n4. Verified Zero Visual UI Alterations',
      category: 'work',
      pinned: true,
      date: 'Today, 4:20 PM',
    },
    {
      id: '2',
      title: 'Sticky Note: Quick Commerce Order',
      content: 'Zepto / Blinkit Order: Cold Brew Coffee, Brown Bread, Fresh Paneer & Alphonso Mangoes',
      category: 'sticky',
      color: '#dfff00',
      pinned: true,
      date: 'Today, 2:15 PM',
    },
    {
      id: '3',
      title: 'AI Micro-Agent Architecture Ideas',
      content: 'Explore combining LLM subagents with client-side WebSockets for real-time sync across Indian regional services.',
      category: 'ideas',
      pinned: false,
      date: 'Jul 24',
    },
  ]);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'ideas' | 'sticky'>('work');
  const [isRecording, setIsRecording] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const addNote = () => {
    if (!newTitle.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      category: newCategory,
      pinned: false,
      date: 'Just now',
    };
    setNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
    setShowCreate(false);
  };

  const generateAINote = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      const generated: Note = {
        id: Date.now().toString(),
        title: `AI Note: ${aiPrompt}`,
        content: `[AI Generated Note]:\n- Executive Summary for "${aiPrompt}"\n- Action Item 1: Complete integration audit.\n- Action Item 2: Verify deep-link schemes.\n- Action Item 3: Test fallback URLs on mobile viewport.`,
        category: 'ideas',
        pinned: true,
        date: 'Generated just now',
      };
      setNotes([generated, ...notes]);
      setAiPrompt('');
      setAiGenerating(false);
    }, 1000);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const filteredNotes = notes.filter((n) => {
    const matchesCat = activeCategory === 'all' || n.category === activeCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="WORKSPACE & AI NOTE SUITE"
        title="Notes, Voice & AI Memos"
        description="Rich markdown notes, sticky notes, voice memo recorder & AI note generator"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(!isRecording)}
              aria-label="Toggle voice recording"
              className={`px-4 py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 border cursor-pointer ${
                isRecording ? 'bg-red-500 text-white animate-pulse border-red-400' : 'btn-glass'
              }`}
            >
              <span className="material-symbols-outlined text-base">mic</span>
              {isRecording ? 'Recording...' : 'Voice Note'}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              aria-label="Create new note"
              className="btn-neon font-mono font-bold text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              New Note
            </button>
          </div>
        }
      />


      {/* AI Note Generator Banner */}
      <div className="anime-stagger glass-card rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 text-[var(--color-primary)] font-mono text-xs font-bold whitespace-nowrap">
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          AI Note Generator:
        </div>
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Topic (e.g. Travel itinerary for Goa, Meeting agenda)..."
          className="flex-1 input-neon"
        />
        <button
          onClick={generateAINote}
          disabled={aiGenerating}
          className="btn-neon cursor-pointer whitespace-nowrap"
        >
          {aiGenerating ? 'Generating...' : 'Generate AI Note'}
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="anime-stagger flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-base">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full input-neon pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
          {['all', 'work', 'personal', 'ideas', 'sticky'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider border cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[var(--color-primary-glow)]'
                  : 'btn-glass text-[var(--color-text-muted)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>


      {/* Modal / Form for Create Note */}
      {showCreate && (
        <div className="anime-stagger glass-card rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--color-text)]">Create New Note</h3>
          <input
            type="text"
            placeholder="Note Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-neon"
          />
          <textarea
            placeholder="Note details or markdown content..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="input-neon h-28 resize-none"
          />
          <div className="flex justify-between items-center">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="input-neon w-auto"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="ideas">Ideas</option>
              <option value="sticky">Sticky Note</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="btn-glass cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                className="btn-neon cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recorder banner */}
      {isRecording && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-xs text-red-400 font-bold">Recording Voice Note... 00:08</span>
          </div>
          <button
            onClick={() => {
              setIsRecording(false);
              setNotes([
                {
                  id: Date.now().toString(),
                  title: 'Voice Recording Memo #4',
                  content: 'Audio memo: "Remember to finalize the deployment checklist before launch."',
                  category: 'personal',
                  pinned: false,
                  date: 'Just now',
                },
                ...notes,
              ]);
            }}
            className="bg-red-500 text-white px-4 py-1.5 rounded-lg font-mono text-xs font-bold uppercase hover:brightness-110 cursor-pointer"
          >
            Stop & Save
          </button>
        </div>
      )}

      {/* Notes Grid */}
      <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`border rounded-xl p-6 space-y-3 relative group transition-all glass-card ${
              note.category === 'sticky'
                ? 'bg-[var(--color-primary-dim)] border-[var(--color-primary-glow)]'
                : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                    note.category === 'sticky'
                      ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface-bright)] text-[var(--color-primary)] border-[var(--color-primary-glow)]'
                  }`}
                >
                  {note.category}
                </span>
                {note.pinned && (
                  <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">push_pin</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => togglePin(note.id)} aria-label="Pin note" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] cursor-pointer">
                  <span className="material-symbols-outlined text-base">
                    {note.pinned ? 'keep' : 'push_pin'}
                  </span>
                </button>
                <button onClick={() => deleteNote(note.id)} aria-label="Delete note" className="text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>

            <h3 className="font-display font-bold text-base text-[var(--color-text)]">{note.title}</h3>
            <p className="font-mono text-xs text-[var(--color-text-muted)] whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
            <p className="font-mono text-[10px] text-[var(--color-text-subtle)] pt-2">{note.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
