'use client';

import React, { useState, useRef, useId } from 'react';
import clsx from 'clsx';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
  className?: string;
}

export function FAQAccordion({ items, title, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const idPrefix = useId();

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className={clsx('space-y-2', className)} aria-label={title ?? 'Frequently asked questions'}>
      {title && (
        <h2 className="font-display text-2xl font-extrabold text-[var(--color-text)] mb-4">
          {title}
        </h2>
      )}

      <dl className="space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          const btnId = `${idPrefix}-faq-btn-${i}`;
          const panelId = `${idPrefix}-faq-panel-${i}`;

          return (
            <div
              key={i}
              className={clsx(
                'rounded-xl border transition-colors duration-200',
                isOpen
                  ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary-dim)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]',
              )}
            >
              <dt>
                <button
                  id={btnId}
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className={clsx(
                    'w-full flex items-center justify-between px-5 py-4 text-left',
                    'font-semibold text-sm text-[var(--color-text)]',
                    'cursor-pointer transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-inset rounded-xl',
                    'hover:text-[var(--color-primary)]',
                  )}
                >
                  <span>{item.question}</span>
                  <span
                    className={clsx(
                      'material-symbols-outlined text-lg text-[var(--color-primary)] flex-shrink-0 ml-4 transition-transform duration-200',
                      isOpen ? 'rotate-180' : 'rotate-0',
                    )}
                  >
                    expand_more
                  </span>
                </button>
              </dt>

              <dd
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                hidden={!isOpen}
                className={clsx(
                  'overflow-hidden transition-all duration-300',
                  isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
                )}
              >
                <div className="px-5 pb-4 text-sm text-[var(--color-text-muted)] leading-relaxed space-y-2">
                  {item.answer}
                </div>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
