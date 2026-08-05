'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

interface Course {
  id: string;
  title: string;
  provider: string;
  category: 'Tech' | 'AI' | 'Finance' | 'Design' | 'Exam Prep';
  duration: string;
  level: string;
  rating: string;
  progress?: number;
  saved?: boolean;
}

export default function LearningPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [activeTab, setActiveTab] = useState<'hub' | 'continue' | 'saved' | 'certificates' | 'quiz' | 'tutor'>('hub');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeVideoModal, setActiveVideoModal] = useState<Course | null>(null);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([
    { id: 'c1', title: 'Full-Stack Next.js 15 & System Architecture', provider: 'WeEverything Academy', category: 'Tech', duration: '14 Hours', level: 'Advanced', rating: '★ 4.9', progress: 75, saved: true },
    { id: 'c2', title: 'NPTEL Data Structures & Algorithms by IIT Madras', provider: 'NPTEL Official', category: 'Tech', duration: '40 Hours', level: 'Intermediate', rating: '★ 4.8', progress: 40, saved: true },
    { id: 'c3', title: 'AI Engineering & LLM Subagent Architecture', provider: 'GeeksforGeeks', category: 'AI', duration: '18 Hours', level: 'Advanced', rating: '★ 4.9', progress: 20, saved: false },
    { id: 'c4', title: 'Indian Stock Market, SIP & Mutual Fund Math', provider: 'Groww Academy', category: 'Finance', duration: '8 Hours', level: 'Beginner', rating: '★ 4.7', saved: false },
    { id: 'c5', title: 'JEE & NEET Physics Fundamentals', provider: 'Physics Wallah (PW)', category: 'Exam Prep', duration: '60 Hours', level: 'Comprehensive', rating: '★ 4.9', saved: false },
    { id: 'c6', title: 'UI/UX Glassmorphism & Modern Design Systems', provider: 'Udemy Pro', category: 'Design', duration: '10 Hours', level: 'Intermediate', rating: '★ 4.8', saved: false },
  ]);

  // Certificates state
  const certificates = [
    { id: 'cert-1', title: 'Certified Next.js 15 Systems Architect', issuer: 'WeEverything OS Academy', date: 'Jul 2026', idCode: 'WE-CERT-88492' },
    { id: 'cert-2', title: 'NPTEL Data Structures & Algorithms', issuer: 'IIT Madras & NPTEL', date: 'May 2026', idCode: 'NPTEL-CS-9912' },
  ];

  // AI Quiz Generator State
  const [quizTopic, setQuizTopic] = useState('Data Structures & Algorithms');
  const [currentQuiz, setCurrentQuiz] = useState<{ q: string; options: string[]; answer: number } | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // AI Study Assistant Chat
  const [tutorInput, setTutorInput] = useState('');
  const [tutorChat, setTutorChat] = useState([
    { role: 'ai', text: 'Namaste! I am your WeEverything AI Study Assistant. Ask me any question about CS, NPTEL courses, competitive exams, or financial math!' },
  ]);

  const handleTutorSend = () => {
    if (!tutorInput.trim()) return;
    const userMsg = { role: 'user', text: tutorInput };
    setTutorChat((prev) => [...prev, userMsg]);
    const q = tutorInput;
    setTutorInput('');

    setTimeout(() => {
      setTutorChat((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Here is the AI study breakdown for "${q}": Key concept identified. Focus on practicing core problem patterns on LeetCode/GeeksforGeeks and reviewing NPTEL lecture notes!`,
        },
      ]);
    }, 600);
  };

  const toggleSaveCourse = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, saved: !c.saved } : c));
  };

  const generateQuiz = () => {
    setSelectedOpt(null);
    setQuizFeedback(null);
    setCurrentQuiz({
      q: `What is the time complexity of searching an element in a Balanced Binary Search Tree (AVL / Red-Black Tree)?`,
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      answer: 1,
    });
  };

  const handleSelectQuizOpt = (idx: number) => {
    if (!currentQuiz) return;
    setSelectedOpt(idx);
    if (idx === currentQuiz.answer) {
      setQuizFeedback('✅ Correct Answer! O(log N) is the height-balanced search complexity.');
    } else {
      setQuizFeedback('❌ Incorrect. The correct answer is O(log N) because the tree height is balanced.');
    }
  };

  const filteredCourses = courses.filter(c => selectedCategory === 'All' || c.category === selectedCategory);
  const continuingCourses = courses.filter(c => (c.progress ?? 0) > 0);
  const savedCourses = courses.filter(c => c.saved);

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      {/* Video Modal / Course Player */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-card border border-[var(--color-border)] rounded-xl max-w-3xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-primary)]">{activeVideoModal.provider}</span>
                <h3 className="font-display font-bold text-xl text-[var(--color-text)]">{activeVideoModal.title}</h3>
              </div>
              <button onClick={() => setActiveVideoModal(null)} className="btn-ghost p-2 cursor-pointer">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="aspect-video bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] flex flex-col items-center justify-center space-y-3">
              <span className="material-symbols-outlined text-6xl text-[var(--color-primary)] animate-pulse">play_circle</span>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">Interactive Lesson Player Active</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveVideoModal(null)} className="btn-neon px-6 py-2 uppercase font-bold cursor-pointer">
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      <MiniAppHeader
        category="INDIAN EDUCATION & TECH ACADEMY"
        title="Learning Platform & AI Academy"
        description="Continue learning, recommended courses, saved wishlist, verified certificates, study analytics & AI tutor"
      />

      {/* Analytics Summary */}
      <div className="anime-stagger grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border border-[var(--color-border)] space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Weekly Study Time</span>
          <h4 className="font-display text-2xl font-black text-[var(--color-text)]">12.5 Hours</h4>
          <p className="font-mono text-[10px] text-emerald-400 font-bold">↑ 2.5 hrs above target</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-[var(--color-border)] space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Active Courses</span>
          <h4 className="font-display text-2xl font-black text-[var(--color-text)]">{continuingCourses.length} Enrolled</h4>
          <p className="font-mono text-[10px] text-[var(--color-primary)] font-bold">Average 45% completion</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-[var(--color-border)] space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Skills Mastered</span>
          <h4 className="font-display text-2xl font-black text-[var(--color-text)]">8 Badges</h4>
          <p className="font-mono text-[10px] text-cyan-400 font-bold">Next.js, NPTEL DSA, Financial Math</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-[var(--color-border)] space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Verified Certificates</span>
          <h4 className="font-display text-2xl font-black text-[var(--color-text)]">{certificates.length} Issued</h4>
          <p className="font-mono text-[10px] text-amber-400 font-bold">1 Certificate Pending</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'hub', label: 'Course Catalog & Hub', icon: 'school' },
          { key: 'continue', label: 'Continue Learning', icon: 'play_circle' },
          { key: 'saved', label: 'Saved Courses', icon: 'bookmark' },
          { key: 'certificates', label: 'Certificates', icon: 'workspace_premium' },
          { key: 'quiz', label: 'AI Quiz Generator', icon: 'quiz' },
          { key: 'tutor', label: 'AI Study Assistant', icon: 'smart_toy' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm'
                : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Course Catalog & Hub */}
      {activeTab === 'hub' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="anime-stagger flex gap-2 overflow-x-auto hide-scrollbar">
            {['All', 'Tech', 'AI', 'Finance', 'Design', 'Exam Prep'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-mono text-xs uppercase font-bold border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]'
                    : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="glass-card border border-[var(--color-border)] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-[var(--color-primary)] transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[9px] uppercase font-bold text-[var(--color-primary)] bg-[var(--color-primary-dim)] px-2.5 py-0.5 rounded border border-[rgba(223,255,0,0.3)]">
                      {c.category}
                    </span>
                    <button
                      onClick={() => toggleSaveCourse(c.id)}
                      className={`material-symbols-outlined text-lg cursor-pointer ${c.saved ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                    >
                      {c.saved ? 'bookmark' : 'bookmark_border'}
                    </button>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] block">{c.provider}</span>
                    <h4 className="font-display font-bold text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mt-0.5">
                      {c.title}
                    </h4>
                  </div>

                  <div className="flex justify-between font-mono text-[10px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
                    <span>{c.duration} • {c.level}</span>
                    <span className="text-[var(--color-primary)] font-bold">{c.rating}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveVideoModal(c)}
                  className="w-full btn-neon py-2.5 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">play_circle</span>
                  {c.progress ? `Resume (${c.progress}%)` : 'Start Learning'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Continue Learning */}
      {activeTab === 'continue' && (
        <div className="anime-stagger space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Active Learning Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continuingCourses.map((c) => (
              <div key={c.id} className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-primary)]">{c.provider}</span>
                    <h4 className="font-display font-bold text-base text-[var(--color-text)]">{c.title}</h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--color-primary)]">{c.progress}%</span>
                </div>

                <div className="w-full bg-[var(--color-surface-dim)] rounded-full h-2.5 border border-[var(--color-border)] overflow-hidden">
                  <div className="bg-[var(--color-primary)] h-full transition-all duration-500" style={{ width: `${c.progress}%` }} />
                </div>

                <button
                  onClick={() => setActiveVideoModal(c)}
                  className="w-full btn-neon py-2.5 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  Continue Lesson
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Saved Courses */}
      {activeTab === 'saved' && (
        <div className="anime-stagger space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Bookmarked Courses Wishlist</h3>
          {savedCourses.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-xl border border-[var(--color-border)]">
              <p className="font-mono text-xs text-[var(--color-text-muted)]">No saved courses yet. Bookmark courses from the hub!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCourses.map((c) => (
                <div key={c.id} className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-3">
                  <span className="font-mono text-[10px] text-[var(--color-primary)] font-bold">{c.provider}</span>
                  <h4 className="font-display font-bold text-sm text-[var(--color-text)]">{c.title}</h4>
                  <button onClick={() => setActiveVideoModal(c)} className="w-full btn-neon py-2 font-mono text-xs uppercase font-bold cursor-pointer">Launch Course</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Certificates */}
      {activeTab === 'certificates' && (
        <div className="anime-stagger space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Verified Course Certificates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-3 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="material-symbols-outlined text-3xl text-amber-400">workspace_premium</span>
                  <h4 className="font-display font-bold text-base text-[var(--color-text)]">{cert.title}</h4>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">{cert.issuer} • Issued {cert.date}</p>
                  <p className="font-mono text-[10px] text-[var(--color-primary)] font-bold">ID: {cert.idCode}</p>
                </div>
                <button onClick={() => alert(`Certificate ${cert.idCode} verified & exported!`)} className="btn-glass border border-[var(--color-border)] p-3 rounded-xl cursor-pointer">
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: AI Quiz Generator */}
      {activeTab === 'quiz' && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 max-w-2xl mx-auto">
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">AI Interactive Knowledge Quiz</h3>

          <div className="space-y-3 font-mono text-xs">
            <input
              type="text"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              placeholder="Quiz topic (e.g. Data Structures, React 19, Microservices)..."
              className="w-full input-neon"
            />
            <button onClick={generateQuiz} className="w-full btn-neon py-3 uppercase font-bold cursor-pointer">
              Generate AI Quiz Question
            </button>
          </div>

          {currentQuiz && (
            <div className="p-6 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl space-y-4">
              <h4 className="font-display font-bold text-base text-[var(--color-text)]">{currentQuiz.q}</h4>
              <div className="space-y-2 font-mono text-xs">
                {currentQuiz.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectQuizOpt(i)}
                    className={`w-full p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      selectedOpt === i
                        ? i === currentQuiz.answer
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                          : 'bg-red-500/20 text-red-400 border-red-500'
                        : 'glass-card border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    {i + 1}. {opt}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div className="p-3 bg-[var(--color-surface-bright)] border border-[var(--color-border)] rounded-xl font-mono text-xs font-bold text-[var(--color-primary)]">
                  {quizFeedback}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: AI Study Assistant */}
      {activeTab === 'tutor' && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <div className="space-y-3 max-h-[380px] overflow-y-auto hide-scrollbar p-2">
            {tutorChat.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`p-4 rounded-xl max-w-lg font-mono text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold'
                      : 'bg-[var(--color-surface-dim)] border border-[var(--color-border)] text-[var(--color-text)]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
            <input
              type="text"
              value={tutorInput}
              onChange={(e) => setTutorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTutorSend()}
              placeholder="Ask AI Tutor anything about CS, exams, or math..."
              className="flex-1 input-neon"
            />
            <button
              onClick={handleTutorSend}
              className="btn-neon uppercase font-bold px-6 py-2.5 cursor-pointer"
            >
              Ask AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
