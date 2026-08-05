'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState, useRef } from 'react';
import { setAuthToken } from '@/lib/api';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

const SAMPLE_POLLS = [
  {
    id: 'sample-1',
    question: 'Which Mini App feature is most critical for daily usage in WeEverything Super App?',
    isAnonymous: false,
    isMultiChoice: false,
    _count: { votes: 142 },
    options: [
      { id: 'opt-1', text: 'WhatsApp Integration & Click-to-Chat', voteCount: 68 },
      { id: 'opt-2', text: 'Everyday Utilities (Weather, QR, Currency)', voteCount: 42 },
      { id: 'opt-3', text: 'Standard & Scientific Calculator / Clock Suite', voteCount: 20 },
      { id: 'opt-4', text: 'Smart App Launchers Matrix (Zepto, Uber)', voteCount: 12 },
    ],
    userVoteOptionIds: [],
    category: 'Technology',
  },
  {
    id: 'sample-2',
    question: 'What is your preferred UI theme for enterprise super apps?',
    isAnonymous: true,
    isMultiChoice: false,
    _count: { votes: 98 },
    options: [
      { id: 'opt-20', text: 'OLED Dark Mode with Neon Accents (#dfff00)', voteCount: 84 },
      { id: 'opt-21', text: 'Clean Glassmorphism Light Mode', voteCount: 14 },
    ],
    userVoteOptionIds: ['opt-20'],
    category: 'Community',
  },
];

export default function PollsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const { accessToken } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isAnon, setIsAnon] = useState(false);
  const [isMulti, setIsMulti] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const qc = useQueryClient();

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
  }, [accessToken]);

  const { data: pollsData, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => {
      const res = await api.get('/polls');
      return res.data.data as any[];
    },
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const validOptions = options.filter((o) => o.trim());
      if (validOptions.length < 2) throw new Error('At least 2 options required');
      const res = await api.post('/polls', { question, options: validOptions, isAnonymous: isAnon, isMultiChoice: isMulti });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['polls'] });
      setQuestion('');
      setOptions(['', '']);
      setShowCreate(false);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIds }: { pollId: string; optionIds: string[] }) => {
      const res = await api.post(`/polls/${pollId}/vote`, { optionIds });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls'] }),
  });

  const addOption = () => setOptions((prev) => [...prev, '']);
  const removeOption = (i: number) => setOptions((prev) => prev.filter((_, idx) => idx !== i));

  const displayPolls = pollsData && pollsData.length > 0 ? pollsData : SAMPLE_POLLS;

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="COMMUNITY VOICE & OPINION"
        title="Polls & Surveys"
        description="Real-time community voting, analytics & instant opinion feedback"
        actions={
          <button
            id="create-poll-btn"
            onClick={() => setShowCreate(true)}
            className="btn-neon font-mono text-xs uppercase font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Poll
          </button>
        }
      />

      {/* Filter Categories */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {['All', 'Trending', 'Company', 'Community', 'Technology', 'Sports'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all border cursor-pointer ${
              activeCategory === cat
                ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]'
                : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Create poll */}
      {showCreate && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="font-display font-bold text-sm text-[var(--color-text)]">Create Community Poll</h3>
            <button onClick={() => setShowCreate(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              id="poll-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input-neon"
              placeholder="Ask a question..."
              autoFocus
            />
            <p className="text-xs font-mono text-[var(--color-text-muted)]">Options</p>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={opt}
                  onChange={(e) => setOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))}
                  className="flex-1 input-neon"
                  placeholder={`Option ${i + 1}`}
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} className="text-red-400 p-2 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addOption} className="text-xs font-mono text-[var(--color-primary)] font-bold cursor-pointer">
              + Add option
            </button>
            <div className="flex gap-4 pt-1 font-mono text-xs text-[var(--color-text-muted)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} className="accent-[var(--color-primary)]" />
                Anonymous
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isMulti} onChange={(e) => setIsMulti(e.target.checked)} className="accent-[var(--color-primary)]" />
                Multiple choice
              </label>
            </div>
            <button
              id="poll-submit"
              onClick={() => createMutation.mutate()}
              disabled={!question.trim() || createMutation.isPending}
              className="btn-neon font-mono text-xs uppercase font-bold w-full py-3 rounded-xl hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending ? 'Creating...' : 'Publish Poll'}
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card border border-[var(--color-border)] h-40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Poll Cards */}
      <div className="anime-stagger space-y-4">
        {displayPolls?.map((poll: any) => {
          const totalVotes = poll._count?.votes ?? poll.options?.reduce((s: number, o: any) => s + o.voteCount, 0) ?? 0;
          const hasVoted = poll.userVoteOptionIds?.length > 0;
          const myVotes = selectedOptions[poll.id] ?? [];

          return (
            <div key={poll.id} className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 hover:border-[var(--color-primary)] transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase font-bold text-[var(--color-primary)] bg-[var(--color-primary-dim)] px-2.5 py-0.5 rounded border border-[rgba(223,255,0,0.3)]">
                  {poll.category || 'COMMUNITY'}
                </span>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{totalVotes} Total Votes</span>
              </div>

              <h3 className="font-display font-bold text-base text-[var(--color-text)]">{poll.question}</h3>

              <div className="space-y-2.5">
                {poll.options?.map((opt: any) => {
                  const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                  const voted = hasVoted;
                  const isSelected = myVotes.includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      disabled={hasVoted}
                      onClick={() => {
                        if (hasVoted) return;
                        if (poll.isMultiChoice) {
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [poll.id]: prev[poll.id]?.includes(opt.id)
                              ? prev[poll.id].filter((id: string) => id !== opt.id)
                              : [...(prev[poll.id] ?? []), opt.id],
                          }));
                        } else {
                          setSelectedOptions((prev) => ({ ...prev, [poll.id]: [opt.id] }));
                        }
                      }}
                      className={clsx(
                        'w-full text-left relative overflow-hidden rounded-xl px-4 py-3 transition-all border font-mono text-xs',
                        voted ? 'cursor-default' : 'hover:border-[var(--color-primary)] cursor-pointer',
                        isSelected && !voted ? 'border-[var(--color-primary)] bg-[var(--color-primary-dim)]' : 'bg-[var(--color-surface-dim)] border-[var(--color-border)]'
                      )}
                    >
                      {voted && (
                        <div
                          className="absolute inset-y-0 left-0 bg-[var(--color-primary-dim)] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span className="text-[var(--color-text)] font-medium">{opt.text}</span>
                        {voted && <span className="font-bold text-[var(--color-primary)]">{pct}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                  {poll.isAnonymous ? '🔒 Anonymous Voting' : 'Public Poll'}
                </span>
                {!hasVoted && myVotes.length > 0 && (
                  <button
                    onClick={() => voteMutation.mutate({ pollId: poll.id, optionIds: myVotes })}
                    disabled={voteMutation.isPending}
                    className="btn-neon font-mono text-xs uppercase font-bold px-5 py-2 rounded-xl cursor-pointer"
                  >
                    Submit Vote
                  </button>
                )}
                {hasVoted && <span className="font-mono text-xs text-emerald-400 font-bold">✓ Voted</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
