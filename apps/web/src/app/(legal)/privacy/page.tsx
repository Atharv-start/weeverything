import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'WeEverything Privacy Policy — how we collect, use, and protect your personal data.',
};

export default function PrivacyPage() {
  const lastUpdated = 'August 2, 2026';

  return (
    <article className="prose-legal">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Legal</span>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">Privacy Policy</h1>
        <p className="font-mono text-xs text-[#555555]">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-10 font-body text-sm text-[#aaaaaa] leading-relaxed">
        <section>
          <p>
            WeEverything Technologies (&ldquo;WeEverything&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at{' '}
            <span className="text-[#dfff00]">weeverything.app</span> and related services.
          </p>
          <p className="mt-4">
            By using WeEverything, you agree to the practices described in this policy. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">1. Information We Collect</h2>
          <h3 className="text-[#dfff00] font-mono text-sm font-bold mb-2">1.1 Information You Provide</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account registration details (display name, username, email address)</li>
            <li>Profile information (bio, location, website)</li>
            <li>Content you create (moments, messages, workspace data, notes)</li>
            <li>Payment and transaction information (processed through our UPI wallet ledger)</li>
            <li>Communications you send via chat or support channels</li>
          </ul>
          <h3 className="text-[#dfff00] font-mono text-sm font-bold mb-2 mt-4">1.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Log data (IP address, browser type, pages visited, timestamps)</li>
            <li>Device information (operating system, device type, screen resolution)</li>
            <li>Usage data (features used, time spent, actions taken)</li>
            <li>Cookies and similar tracking technologies (see our Cookie Policy)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide, operate, and maintain our services</li>
            <li>To authenticate your identity and secure your account</li>
            <li>To process wallet transactions and maintain the double-entry ledger</li>
            <li>To deliver real-time messaging and notification features</li>
            <li>To personalise your experience within the app</li>
            <li>To detect, prevent, and respond to fraud or abuse</li>
            <li>To comply with applicable legal obligations</li>
            <li>To communicate service updates, security notices, and policy changes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">3. Legal Basis for Processing (GDPR)</h2>
          <p>Where applicable under GDPR and similar regulations, we process your data on the following legal bases:</p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li><strong className="text-white">Contract:</strong> To fulfil our obligations when you use our services</li>
            <li><strong className="text-white">Legitimate Interest:</strong> To operate, improve, and secure our platform</li>
            <li><strong className="text-white">Consent:</strong> For marketing communications and optional analytics</li>
            <li><strong className="text-white">Legal Obligation:</strong> To comply with applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">4. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Service providers who assist in operating our platform (hosting, analytics, authentication via Clerk)</li>
            <li>Payment processors for UPI transaction verification</li>
            <li>Law enforcement or regulatory bodies where legally required</li>
            <li>Other users, only as you explicitly choose (e.g., public profile, posted moments)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">5. Data Retention</h2>
          <p>
            We retain your personal data for as long as necessary to provide our services and comply with legal obligations.
            See our <a href="/data-retention" className="text-[#dfff00] hover:underline">Data Retention Policy</a> for details.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">6. Security</h2>
          <p>
            We implement industry-standard security measures including Argon2id password hashing, JWT token rotation,
            encrypted data transmission (TLS), and role-based access controls. For our full security posture, see our{' '}
            <a href="/security" className="text-[#dfff00] hover:underline">Security Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your account and data</li>
            <li>Object to or restrict certain processing activities</li>
            <li>Receive your data in a portable format</li>
            <li>Withdraw consent at any time (where processing is consent-based)</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at{' '}
            <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a>.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">8. Cookies</h2>
          <p>
            We use cookies and similar technologies for authentication, preferences, and analytics.
            See our <a href="/cookies" className="text-[#dfff00] hover:underline">Cookie Policy</a> for a full breakdown.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">9. Children&apos;s Privacy</h2>
          <p>
            WeEverything is not directed to children under the age of 13 (or 16 in certain jurisdictions).
            We do not knowingly collect personal data from minors. If you believe we have collected such data,
            please contact us immediately at{' '}
            <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a>.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes via email or
            an in-app notice. Continued use of the service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">11. Contact Us</h2>
          <p>For privacy-related inquiries:</p>
          <div className="mt-3 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] font-mono text-xs space-y-1">
            <p className="text-white">WeEverything Technologies</p>
            <p>Email: <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a></p>
            <p>Website: <a href="https://weeverything.app" className="text-[#dfff00] hover:underline">weeverything.app</a></p>
          </div>
        </section>
      </div>
    </article>
  );
}
