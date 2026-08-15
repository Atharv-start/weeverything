'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { streamCopilot, aiClient, type CopilotMessage } from '@/lib/ai-client';
import { Tooltip } from '@/components/ui/Tooltip';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  suggestions?: string[];
}

export function CopilotPanel({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your WeEverything AI Copilot. I can help you navigate the app, answer questions, summarize your data, and more. What can I help you with?",
      suggestions: ['What are my pending tasks?', 'Summarize recent chats', 'Show spending insights'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stopStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', streaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    let accumulated = '';
    let hasReceivedContent = false;

    const stop = streamCopilot(
      text,
      pathname,
      (delta) => {
        hasReceivedContent = true;
        accumulated += delta;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulated } : m)),
        );
      },
      () => {
        // If no content was received, show a helpful fallback
        if (!hasReceivedContent || !accumulated.trim()) {
          const fallback =
            "I can help with your tasks, wallet, messages, Mini Apps, and other WeEverything features. What would you like to do?";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: fallback, streaming: false }
                : m,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, streaming: false } : m)),
          );
        }
        setIsStreaming(false);
        stopStreamRef.current = null;
      },
      (err) => {
        // Detect rate limit vs other errors
        const isRateLimit =
          err instanceof MessageEvent &&
          typeof err.data === 'string' &&
          err.data.toLowerCase().includes('rate');

        const fallback = isRateLimit
          ? "You're sending messages too quickly. Please wait a moment and try again."
          : "I'm having trouble connecting right now. Please try again in a moment. If the issue persists, check your connection.";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: fallback, streaming: false }
              : m,
          ),
        );
        setIsStreaming(false);
        stopStreamRef.current = null;
      },
    );

    stopStreamRef.current = stop;
  }, [isStreaming, pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    void sendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">AI Copilot</p>
            <p className="text-xs text-[var(--color-text-muted)]">WeEverything</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '11px' }}>auto_awesome</span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Copilot</span>
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-primary)] text-white rounded-br-sm'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] rounded-bl-sm border border-[var(--color-border)]'
                }`}
              >
                {msg.content || (msg.streaming && (
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ))}
                {msg.streaming && msg.content && (
                  <span className="inline-block w-0.5 h-4 bg-[var(--color-primary)] ml-0.5 animate-pulse align-middle" />
                )}
              </div>

              {/* Quick suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && !isStreaming && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-xs px-2.5 py-1 rounded-full border border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] px-3 py-2 focus-within:border-[var(--color-primary)] transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none disabled:opacity-50"
          />
          <Tooltip content="Send message to AI Copilot">
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
              className="w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </Tooltip>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-1.5">
          AI can make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
}
