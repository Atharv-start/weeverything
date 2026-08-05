'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct a mailto link as the fallback since backend mailer setup may vary
    const subject = encodeURIComponent(`[WeEverything Support] ${form.subject}: ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
    window.location.href = `mailto:support@weeverything.app?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <article className="prose-legal">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Support</span>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">Contact Us</h1>
        <p className="font-mono text-xs text-[#555555]">Get in touch with the WeEverything team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-6 font-body text-sm text-[#aaaaaa]">
          <p>
            We are here to help. Whether you have a question about the platform, need technical support,
            or want to report a problem — send us a message and we will respond as quickly as possible.
          </p>

          <div className="space-y-4">
            {[
              {
                icon: 'email',
                label: 'General Support',
                value: 'support@weeverything.app',
                href: 'mailto:support@weeverything.app',
              },
              {
                icon: 'security',
                label: 'Security Reports',
                value: 'security@weeverything.app',
                href: 'mailto:security@weeverything.app',
              },
            ].map(({ icon, label, value, href }) => (
              <div key={label} className="flex gap-3 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <span className="material-symbols-outlined text-[#dfff00] flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-[#555555] font-mono text-[10px] uppercase tracking-wider">{label}</p>
                  <a href={href} className="text-white font-mono text-xs hover:text-[#dfff00] transition-colors">{value}</a>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#555555] mb-2">Response Time</p>
            <p className="text-white font-mono text-xs">We aim to respond within 48 business hours.</p>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Legal Pages</p>
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
              { href: '/security', label: 'Security & Disclosure' },
              { href: '/community-guidelines', label: 'Community Guidelines' },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="block font-mono text-xs text-[#888888] hover:text-[#dfff00] transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-3">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#191e00] border border-[#dfff00]/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-[#dfff00]">check_circle</span>
              </div>
              <h2 className="font-display font-bold text-xl text-white">Message sent</h2>
              <p className="font-body text-sm text-[#888888] max-w-xs">
                Your email client should have opened. We will respond to <strong className="text-white">{form.email}</strong> as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Your Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl font-mono text-xs text-white placeholder-[#333333] focus:border-[#dfff00] focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl font-mono text-xs text-white placeholder-[#333333] focus:border-[#dfff00] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Subject</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl font-mono text-xs text-white focus:border-[#dfff00] focus:outline-none transition-colors"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Wallet / Billing</option>
                  <option value="privacy">Privacy / Data</option>
                  <option value="report">Report Abuse</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Message *</label>
                <textarea
                  required
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your question or issue in detail..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl font-mono text-xs text-white placeholder-[#333333] focus:border-[#dfff00] focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#dfff00] text-black font-mono text-sm font-bold hover:bg-[#c8e600] transition-colors active:scale-[0.99]"
              >
                Send Message
              </button>

              <p className="font-mono text-[10px] text-[#444444] text-center">
                This will open your email client. Alternatively, email us directly at support@weeverything.app
              </p>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}
