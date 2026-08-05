import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'WeEverything Community Guidelines — the standards for respectful and safe participation on our platform.',
};

export default function CommunityGuidelinesPage() {
  return (
    <article className="prose-legal">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Legal</span>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">Community Guidelines</h1>
        <p className="font-mono text-xs text-[#555555]">Last updated: August 2, 2026</p>
      </div>

      <div className="space-y-10 font-body text-sm text-[#aaaaaa] leading-relaxed">
        <section>
          <p>
            WeEverything is a platform built for meaningful connection, collaboration, and productivity.
            These Community Guidelines define the standards of behaviour expected from every user.
            Violations may result in content removal, account suspension, or permanent termination.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">1. Be Respectful</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Treat all users with dignity and respect, regardless of their background, beliefs, or identity.</li>
            <li>Disagreements are normal — debate ideas, not people.</li>
            <li>Do not use slurs, hate speech, or dehumanising language.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">2. No Harassment or Bullying</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Do not harass, threaten, intimidate, or stalk other users.</li>
            <li>Do not coordinate or participate in campaigns of targeted abuse.</li>
            <li>Do not share others&apos; private information without their consent (doxxing).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">3. No Harmful or Dangerous Content</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Do not post content that promotes self-harm, suicide, or violence.</li>
            <li>Do not share instructions for creating weapons or conducting illegal activities.</li>
            <li>Do not post content that sexualises minors.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">4. No Misinformation</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Do not deliberately spread false information that could cause real-world harm.</li>
            <li>Do not impersonate other people, organisations, or public figures.</li>
            <li>Satire and parody are permitted but must be clearly labelled.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">5. No Spam or Manipulation</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Do not post repetitive, unsolicited, or off-topic content.</li>
            <li>Do not use automated tools to create fake engagement or inflate metrics.</li>
            <li>Do not engage in phishing, scamming, or fraudulent financial activities.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">6. Respect Intellectual Property</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Only share content you own or have the right to share.</li>
            <li>Give credit to original creators where appropriate.</li>
            <li>Do not reproduce copyrighted material without permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">7. Financial Conduct</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Do not use the wallet or UPI features for fraudulent transactions.</li>
            <li>Do not solicit payments through deceptive means.</li>
            <li>All financial activity must comply with applicable laws.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">8. Reporting Violations</h2>
          <p>
            If you encounter content or behaviour that violates these guidelines, please report it using the
            in-app reporting tools or contact us at{' '}
            <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a>.
            We take all reports seriously and will investigate promptly.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">9. Enforcement</h2>
          <p>Depending on severity, violations may result in:</p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Content removal</li>
            <li>Warning issued to your account</li>
            <li>Temporary account suspension</li>
            <li>Permanent account termination</li>
            <li>Reporting to law enforcement where legally required</li>
          </ul>
          <p className="mt-3">
            Appeals can be submitted to <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
