import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Policy',
  description: 'WeEverything Security Policy and Responsible Disclosure — how we secure the platform and how to report vulnerabilities.',
};

export default function SecurityPage() {
  return (
    <article className="prose-legal">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Security</span>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">Security Policy</h1>
        <p className="font-mono text-xs text-[#555555]">Last updated: August 2, 2026</p>
      </div>

      <div className="space-y-10 font-body text-sm text-[#aaaaaa] leading-relaxed">
        <section>
          <p>
            Security is foundational to WeEverything. This page describes our security posture, the measures we take
            to protect your data, and how to responsibly disclose security vulnerabilities.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">Our Security Measures</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {[
              { icon: 'lock', title: 'Password Security', desc: 'Argon2id hashing with memory cost=65536, time cost=3. No plaintext passwords ever stored.' },
              { icon: 'token', title: 'Token Security', desc: 'JWT access tokens (15-minute expiry) + rotating refresh tokens (30 days), stored as hashes in database.' },
              { icon: 'security', title: 'Transport Security', desc: 'All communications encrypted via TLS 1.2+. HTTPS enforced across all endpoints.' },
              { icon: 'manage_accounts', title: 'Access Control', desc: 'Hierarchical RBAC system (USER < MODERATOR < ADMIN < SUPER_ADMIN). Least-privilege principle.' },
              { icon: 'speed', title: 'Rate Limiting', desc: '100 requests/minute general limit, 10 requests/minute on authentication endpoints.' },
              { icon: 'account_balance', title: 'Financial Security', desc: 'Wallet balance calculated from double-entry ledger, never trusted from client. All transfers use database transactions with idempotency keys.' },
              { icon: 'verified_user', title: 'Authentication', desc: 'Multi-factor authentication via Clerk. WebSocket connections validated server-side on connect.' },
              { icon: 'inventory_2', title: 'Data Isolation', desc: 'Row-level security ensures users can only access their own data. Admin endpoints require elevated roles.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-base text-[#dfff00]">{icon}</span>
                  <h3 className="text-white font-mono text-sm font-bold">{title}</h3>
                </div>
                <p className="text-[11px] text-[#888888]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">Responsible Disclosure Policy</h2>
          <p>
            We encourage security researchers and users to responsibly report security vulnerabilities.
            If you discover a potential security issue, please follow these guidelines:
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex gap-3 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
              <span className="material-symbols-outlined text-[#dfff00] flex-shrink-0">email</span>
              <div>
                <p className="text-white font-mono text-sm font-bold">1. Email us privately</p>
                <p className="text-[#888888] text-xs mt-1">
                  Send details to <a href="mailto:security@weeverything.app" className="text-[#dfff00] hover:underline">security@weeverything.app</a>.
                  Please do not post publicly until we have addressed the issue.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
              <span className="material-symbols-outlined text-[#dfff00] flex-shrink-0">description</span>
              <div>
                <p className="text-white font-mono text-sm font-bold">2. Include a clear description</p>
                <p className="text-[#888888] text-xs mt-1">
                  Describe the vulnerability, steps to reproduce, potential impact, and any proof-of-concept (if available).
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
              <span className="material-symbols-outlined text-[#dfff00] flex-shrink-0">schedule</span>
              <div>
                <p className="text-white font-mono text-sm font-bold">3. Allow time to respond</p>
                <p className="text-[#888888] text-xs mt-1">
                  We will acknowledge receipt within 48 hours and work to resolve critical issues within 90 days.
                  We will keep you informed of progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">Scope</h2>
          <p>In-scope for responsible disclosure:</p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Authentication and authorisation vulnerabilities</li>
            <li>Data exposure or injection vulnerabilities (SQL injection, XSS, CSRF)</li>
            <li>Privilege escalation vulnerabilities</li>
            <li>Wallet and financial transaction vulnerabilities</li>
          </ul>
          <p className="mt-3">Out of scope:</p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Social engineering attacks</li>
            <li>Physical security</li>
            <li>Denial-of-service attacks</li>
            <li>Third-party services we do not control</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">Safe Harbour</h2>
          <p>
            We will not pursue legal action against researchers who follow this responsible disclosure policy in good faith.
            Please do not access, modify, or delete user data that is not your own, and do not disrupt services for other users.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">Contact</h2>
          <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] font-mono text-xs space-y-1">
            <p>Security reports: <a href="mailto:security@weeverything.app" className="text-[#dfff00] hover:underline">security@weeverything.app</a></p>
            <p>General support: <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a></p>
          </div>
        </section>
      </div>
    </article>
  );
}
