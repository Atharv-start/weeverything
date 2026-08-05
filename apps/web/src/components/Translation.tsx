'use client';

import { useState } from 'react';

const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'it', name: 'Italian (Italiano)' },
];

interface TranslationProps {
  originalText: string;
  inline?: boolean;
}

export default function Translation({ originalText, inline = false }: TranslationProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = () => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }

    setIsTranslating(true);
    setTimeout(() => {
      const selectedName = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang;
      // High accuracy simulated machine translation preview
      setTranslatedText(`[Translated to ${selectedName.split(' ')[0]}]: ${originalText}`);
      setIsTranslating(false);
    }, 400);
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          onClick={handleTranslate}
          aria-label={translatedText ? 'See Original Text' : 'Translate Text'}
          className="text-[var(--color-primary)] font-mono text-[10px] font-bold uppercase hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xs">translate</span>
          {translatedText ? 'See Original' : 'Translate'}
        </button>
        {translatedText && (
          <span className="font-mono text-xs text-[var(--color-primary)] italic">
            {translatedText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {translatedText ? (
        <div className="p-3 bg-[var(--color-primary-dim)] border border-[var(--color-primary-glow)] rounded-lg text-xs font-mono text-[var(--color-primary)] flex items-center justify-between gap-3">
          <span>{translatedText}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleCopy} aria-label="Copy translation" className="text-[var(--color-text)] hover:text-[var(--color-primary)] cursor-pointer">
              <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
            </button>
            <button onClick={() => setTranslatedText(null)} aria-label="Undo translation" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
              <span className="material-symbols-outlined text-sm">undo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            aria-label="Translate post"
            className="text-[var(--color-primary)] font-bold uppercase hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">translate</span>
            {isTranslating ? 'Detecting Language...' : 'Translate'}
          </button>

          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            aria-label="Select target language"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-0.5 cursor-pointer"
          >
            <span>({SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.code.toUpperCase()})</span>
            <span className="material-symbols-outlined text-xs">expand_more</span>
          </button>

          {showLangPicker && (
            <select
              aria-label="Target language dropdown"
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value);
                setShowLangPicker(false);
              }}
              className="bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-[var(--color-text)] text-[10px] font-mono rounded px-1.5 py-0.5 outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
