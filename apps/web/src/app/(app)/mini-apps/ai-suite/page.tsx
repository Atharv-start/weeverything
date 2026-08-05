'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

type AITab =
  | 'insights'
  | 'assistant'
  | 'search'
  | 'summarizer'
  | 'translator'
  | 'writing'
  | 'email'
  | 'notes'
  | 'calendar';

export default function AISuitePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [activeTab, setActiveTab] = useState<AITab>('insights');

  // AI Assistant Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Namaste! I am your WeEverything AI Assistant. How can I assist you today with productivity, Indian tax/GST calculations, travel planning, or writing?' },
  ]);

  // AI Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // AI Summarizer state
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');

  // AI Translator state
  const [transText, setTransText] = useState('Welcome to the Indian Super App ecosystem');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [translatedResult, setTranslatedResult] = useState('');

  // AI Writing & Email composer state
  const [promptInput, setPromptInput] = useState('');
  const [writtenContent, setWrittenContent] = useState('');

  // Dynamic AI Insights State
  const [insightTimeframe, setInsightTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = { role: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, msg]);
    const userQ = chatInput;
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Here is the AI response for "${userQ}": Everything has been analyzed. You can execute UPI transfers, check IRCTC train statuses, or organize your notes seamlessly within WeEverything OS!`,
        },
      ]);
    }, 600);
  };

  const handleRunSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchResult(`AI Deep Search Results for "${searchQuery}": Found 14 verified matching records across UPI logs, DigiLocker docs, and Indian app launchers.`);
  };

  const handleSummarize = () => {
    if (!inputText.trim()) return;
    setSummary(`[AI Key Summary]: ${inputText.slice(0, 120)}... (Extracted 3 primary key action items for quick review)`);
  };

  const handleTranslate = () => {
    const dict: Record<string, string> = {
      Hindi: 'भारतीय सुपर ऐप पारिस्थितिकी तंत्र में आपका स्वागत है',
      Tamil: 'இந்திய சூப்பர் ஆப் சுற்றுச்சூழல் அமைப்பிற்கு வரவேற்கிறோம்',
      Telugu: 'భారతీయ సూపర్ యాప్ ఎకోసిస్టమ్‌కు స్వాగతం',
      Bengali: 'ভারতীয় সুপার অ্যাপ ইকোসিস্টেমে স্বাগতম',
      Marathi: 'भारतीय सुपर ॲप इकोसिस्टममध्ये आपले स्वागत आहे',
      Kannada: 'ಭಾರತೀಯ ಸೂಪರ್ ಆಪ್ ಪರಿಸರ ವ್ಯವಸ್ಥೆಗೆ ಸುಸ್ವಾಗತ',
      Gujarati: 'ભારતીય સુપર એપ ઇકોસિસ્ટમમાં આપનું સ્વાગત છે',
    };
    setTranslatedResult(dict[targetLang] || `[Translated to ${targetLang}]: ${transText}`);
  };

  const handleCompose = (type: 'writing' | 'email' | 'notes') => {
    if (!promptInput.trim()) return;
    if (type === 'email') {
      setWrittenContent(`Subject: ${promptInput}\n\nDear Team,\n\nI hope this message finds you well. I am writing regarding ${promptInput}. Please review the attached deliverables and let me know your thoughts.\n\nWarm regards,\nWeEverything User`);
    } else if (type === 'notes') {
      setWrittenContent(`# AI Generated Notes: ${promptInput}\n\n- Key Point 1: Execution strategy initialized.\n- Key Point 2: Verified API intent integration.\n- Action Item: Complete deployment verification.`);
    } else {
      setWrittenContent(`AI Draft (${promptInput}):\n${promptInput} is an essential milestone. Implementing robust workflows ensures high performance and reliability across the platform.`);
    }
  };

  const refreshInsights = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 800);
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="WE-OS INTELLIGENCE SUITE"
        title="AI Suite & Insights Hub"
        description="AI Financial & Productivity Insights, Multilingual Assistant, Deep Search, Summarizer, Translator & Smart Generator"
        actions={
          <button
            onClick={refreshInsights}
            disabled={isAnalyzing}
            className="btn-neon font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-2"
          >
            <span className={`material-symbols-outlined text-base ${isAnalyzing ? 'animate-spin' : ''}`}>
              {isAnalyzing ? 'sync' : 'auto_awesome'}
            </span>
            {isAnalyzing ? 'Analyzing User Data...' : 'Re-Run AI Insights'}
          </button>
        }
      />

      {/* Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'insights', label: 'AI Insights Dashboard', icon: 'insights' },
          { key: 'assistant', label: 'AI Assistant', icon: 'smart_toy' },
          { key: 'search', label: 'Deep Search', icon: 'manage_search' },
          { key: 'summarizer', label: 'Summarizer', icon: 'summarize' },
          { key: 'translator', label: 'Translator', icon: 'g_translate' },
          { key: 'writing', label: 'AI Writing', icon: 'edit_note' },
          { key: 'email', label: 'Email Composer', icon: 'mail' },
          { key: 'notes', label: 'Note Generator', icon: 'note_add' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as AITab)}
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

      {/* AI Insights Dashboard Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="anime-stagger flex justify-between items-center glass-card p-4 rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">analytics</span>
              <h3 className="font-display font-bold text-sm text-[var(--color-text)]">Live System Analytics & Smart Recommendations</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setInsightTimeframe('weekly')}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase font-bold border cursor-pointer ${
                  insightTimeframe === 'weekly'
                    ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[var(--color-primary-glow)]'
                    : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'
                }`}
              >
                Weekly View
              </button>
              <button
                onClick={() => setInsightTimeframe('monthly')}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase font-bold border cursor-pointer ${
                  insightTimeframe === 'monthly'
                    ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[var(--color-primary-glow)]'
                    : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'
                }`}
              >
                Monthly View
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-5 border border-[var(--color-border)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Spending Analysis</span>
                <span className="material-symbols-outlined text-[var(--color-primary)]">account_balance_wallet</span>
              </div>
              <h4 className="font-display text-2xl font-black text-[var(--color-text)]">₹14,200</h4>
              <p className="font-mono text-[11px] text-[var(--color-primary)] font-semibold">↓ 12% lower than last {insightTimeframe}</p>
              <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">42% Quick Commerce (Zepto/Zomato), 28% Travel (IRCTC/Uber)</p>
            </div>

            <div className="glass-card rounded-xl p-5 border border-[var(--color-border)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Productivity Score</span>
                <span className="material-symbols-outlined text-emerald-400">task_alt</span>
              </div>
              <h4 className="font-display text-2xl font-black text-[var(--color-text)]">92 / 100</h4>
              <p className="font-mono text-[11px] text-emerald-400 font-semibold">↑ 18 Tasks Completed</p>
              <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">High focus efficiency during morning hours (09:00 AM - 01:00 PM)</p>
            </div>

            <div className="glass-card rounded-xl p-5 border border-[var(--color-border)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Calendar Load</span>
                <span className="material-symbols-outlined text-cyan-400">calendar_month</span>
              </div>
              <h4 className="font-display text-2xl font-black text-[var(--color-text)]">6.5 Hrs / Day</h4>
              <p className="font-mono text-[11px] text-cyan-400 font-semibold">Optimal Work-Rest Ratio</p>
              <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">3 Standup calls & 2 execution blocks scheduled today</p>
            </div>

            <div className="glass-card rounded-xl p-5 border border-[var(--color-border)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Chat & Channels</span>
                <span className="material-symbols-outlined text-violet-400">forum</span>
              </div>
              <h4 className="font-display text-2xl font-black text-[var(--color-text)]">14 Channels Active</h4>
              <p className="font-mono text-[11px] text-violet-400 font-semibold">100% Response Rate</p>
              <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">No unread urgent messages across workspace chats</p>
            </div>
          </div>

          {/* AI Smart Recommendations Grid */}
          <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6 border border-[var(--color-border)] space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">savings</span>
                <h4 className="font-display font-bold text-base text-[var(--color-text)]">Smart Savings & Budget Recommendations</h4>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] space-y-1">
                  <div className="flex justify-between font-bold text-[var(--color-text)]">
                    <span>💡 Optimize Quick Commerce Orders</span>
                    <span className="text-[var(--color-primary)]">Save ~₹1,800/mo</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] font-body">Consolidate Zepto & Swiggy Instamart orders to avoid repetitive surge delivery fees.</p>
                </div>

                <div className="p-3.5 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] space-y-1">
                  <div className="flex justify-between font-bold text-[var(--color-text)]">
                    <span>💳 Use CRED / UPI Cashback Offers</span>
                    <span className="text-[var(--color-primary)]">Save ~₹600/mo</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] font-body">Route monthly utility bills through CRED Pay for instant cashback points.</p>
                </div>

                <div className="p-3.5 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] space-y-1">
                  <div className="flex justify-between font-bold text-[var(--color-text)]">
                    <span>📈 SIP Wealth Allocation</span>
                    <span className="text-[var(--color-primary)]">Wealth Building</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] font-body">You have ₹10,800 remaining in monthly surplus. Allocate 20% to Zerodha/Groww Index Mutual Funds.</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 border border-[var(--color-border)] space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                <span className="material-symbols-outlined text-amber-400 text-xl">bolt</span>
                <h4 className="font-display font-bold text-base text-[var(--color-text)]">Productivity & Task Completion Insights</h4>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] space-y-1">
                  <div className="flex justify-between font-bold text-[var(--color-text)]">
                    <span>⚡ Peak Deep Work Window</span>
                    <span className="text-amber-400">10:00 AM - 01:00 PM</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] font-body">You complete 75% of your high-priority tasks during morning coding sprints.</p>
                </div>

                <div className="p-3.5 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] space-y-1">
                  <div className="flex justify-between font-bold text-[var(--color-text)]">
                    <span>🎯 Weekly Task Streak</span>
                    <span className="text-emerald-400">12 Days Active</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] font-body">All critical sprint goals in WeEverything OS have been met 2 days ahead of schedule.</p>
                </div>

                <div className="p-3.5 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] space-y-1">
                  <div className="flex justify-between font-bold text-[var(--color-text)]">
                    <span>📚 Learning Platform Goal</span>
                    <span className="text-cyan-400">2.5 Hrs / Week</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] font-body">You are 80% through the Next.js 15 & System Architecture course on LeetCode/NPTEL.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Chat */}
      {activeTab === 'assistant' && (
        <div className="anime-stagger glass-card rounded-xl p-6 space-y-4 border border-[var(--color-border)]">
          <div className="space-y-3 max-h-[400px] overflow-y-auto hide-scrollbar p-2">
            {chatMessages.map((msg, i) => (
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
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask AI Assistant anything about code, finance, travel or productivity..."
              className="flex-1 input-neon"
            />
            <button
              onClick={handleSendChat}
              className="btn-neon uppercase font-bold"
            >
              Send AI
            </button>
          </div>
        </div>
      )}

      {/* AI Deep Knowledge Search */}
      {activeTab === 'search' && (
        <div className="anime-stagger glass-card rounded-xl p-6 space-y-4 border border-[var(--color-border)]">
          <h3 className="font-display font-bold text-base text-[var(--color-text)]">AI Deep Knowledge Search</h3>
          <div className="flex gap-2 font-mono text-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
              placeholder="Enter search query (e.g. Zepto delivery terms, UPI limits, IRCTC refund policy)..."
              className="flex-1 input-neon"
            />
            <button
              onClick={handleRunSearch}
              className="btn-neon uppercase font-bold"
            >
              AI Search
            </button>
          </div>

          {searchResult && (
            <div className="p-5 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl font-mono text-xs text-[var(--color-text)] leading-relaxed">
              {searchResult}
            </div>
          )}
        </div>
      )}

      {/* AI Summarizer */}
      {activeTab === 'summarizer' && (
        <div className="anime-stagger glass-card rounded-xl p-6 space-y-4 border border-[var(--color-border)]">
          <h3 className="font-display font-bold text-base text-[var(--color-text)]">AI Instant Document Summarizer</h3>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste long text, articles, or meeting notes here to summarize..."
            className="w-full input-neon h-32 resize-none"
          />
          <button
            onClick={handleSummarize}
            className="w-full btn-neon uppercase font-bold py-3"
          >
            Summarize Content
          </button>

          {summary && (
            <div className="p-5 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl font-mono text-xs text-[var(--color-primary)] leading-relaxed">
              {summary}
            </div>
          )}
        </div>
      )}

      {/* AI Translator */}
      {activeTab === 'translator' && (
        <div className="anime-stagger glass-card rounded-xl p-6 space-y-4 border border-[var(--color-border)]">
          <h3 className="font-display font-bold text-base text-[var(--color-text)]">AI Indian Regional Language Translator</h3>
          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Target Indian Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full input-neon"
              >
                {['Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Gujarati'].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Text to Translate</label>
              <textarea
                value={transText}
                onChange={(e) => setTransText(e.target.value)}
                className="w-full input-neon h-20 resize-none"
              />
            </div>

            <button
              onClick={handleTranslate}
              className="w-full btn-neon uppercase font-bold py-3"
            >
              Translate Text
            </button>

            {translatedResult && (
              <div className="p-5 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl font-mono text-sm text-[var(--color-primary)] font-bold">
                {translatedResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Writing / Email / Note Generator */}
      {(activeTab === 'writing' || activeTab === 'email' || activeTab === 'notes') && (
        <div className="anime-stagger glass-card rounded-xl p-6 space-y-4 border border-[var(--color-border)]">
          <h3 className="font-display font-bold text-base text-[var(--color-text)]">
            {activeTab === 'email' ? 'AI Smart Email Composer' : activeTab === 'notes' ? 'AI Note Generator' : 'AI Writing Assistant'}
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={activeTab === 'email' ? 'Enter email topic (e.g. Leave request, Project update)...' : 'Enter topic or prompt...'}
              className="w-full input-neon"
            />

            <button
              onClick={() => handleCompose(activeTab as any)}
              className="w-full btn-neon uppercase font-bold py-3"
            >
              Generate Content
            </button>

            {writtenContent && (
              <div className="p-5 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl font-mono text-xs text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">
                {writtenContent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
