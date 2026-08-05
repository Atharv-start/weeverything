import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description: 'WeEverything Acceptable Use Policy — what you may and may not do on our platform.',
};

export default function AcceptableUsePage() {
  return (
    <article className="prose-legal">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Legal</span>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">Acceptable Use Policy</h1>
        <p className="font-mono text-xs text-[#555555]">Last updated: August 2, 2026</p>
      </div>

      <div className="space-y-10 font-body text-sm text-[#aaaaaa] leading-relaxed">
        <section>
          <p>
            This Acceptable Use Policy (&ldquo;AUP&rdquo;) applies to all users of WeEverything Technologies&apos; platform.
            It supplements our <a href="/terms" className="text-[#dfff00] hover:underline">Terms of Service</a> and defines
            specific prohibited activities that may result in account action.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">1. Prohibited Technical Activities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Attempting to gain unauthorised access to our systems, servers, or other users&apos; accounts</li>
            <li>Probing, scanning, or testing the vulnerability of our systems without written permission</li>
            <li>Introducing malware, viruses, trojans, or destructive code</li>
            <li>Overloading our infrastructure through denial-of-service attacks</li>
            <li>Automated scraping, crawling, or data extraction without explicit API authorisation</li>
            <li>Reverse engineering or decompiling our software</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">2. Prohibited Content</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Child sexual abuse material (CSAM) — will be reported to relevant authorities immediately</li>
            <li>Non-consensual intimate imagery</li>
            <li>Terrorist or extremist propaganda</li>
            <li>Content designed to facilitate real-world violence</li>
            <li>Illegally obtained personal data of others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">3. Prohibited Commercial Activities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Sending unsolicited commercial communications (spam)</li>
            <li>Multi-level marketing or pyramid scheme promotion</li>
            <li>Sale of regulated goods (weapons, drugs, counterfeit items)</li>
            <li>Financial fraud, investment scams, or money laundering</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">4. Account Conduct</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Creating multiple accounts to evade a ban or suspension</li>
            <li>Selling or transferring your account to another person</li>
            <li>Sharing credentials to allow unauthorised access</li>
            <li>Impersonating WeEverything staff or support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">5. Wallet & Financial Conduct</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Using wallet features to process payments for illegal goods or services</li>
            <li>Chargebacks initiated in bad faith</li>
            <li>Exploiting ledger or transaction bugs for financial gain — report to us immediately instead</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">6. Consequences</h2>
          <p>
            Violations of this AUP may result in immediate account suspension, permanent termination, legal action,
            and/or referral to law enforcement. We reserve the right to cooperate fully with any law enforcement investigation.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">7. Reporting Abuse</h2>
          <p>
            Report violations at{' '}
            <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a>.
            Security vulnerabilities should be reported per our{' '}
            <a href="/security" className="text-[#dfff00] hover:underline">Security & Responsible Disclosure Policy</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
