import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'WeEverything Terms of Service — the agreement governing your use of our platform.',
};

export default function TermsPage() {
  return (
    <article className="prose-legal">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Legal</span>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">Terms of Service</h1>
        <p className="font-mono text-xs text-[#555555]">Last updated: August 2, 2026</p>
      </div>

      <div className="space-y-10 font-body text-sm text-[#aaaaaa] leading-relaxed">
        <section>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of WeEverything Technologies&apos;
            platform, mobile applications, and services (collectively, the &ldquo;Services&rdquo;).
            By accessing or using the Services, you agree to be bound by these Terms.
            If you disagree with any part of these Terms, you may not use the Services.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">1. Eligibility</h2>
          <p>
            You must be at least 13 years old (or 16 in the European Union) to use WeEverything.
            By using our Services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
            If you are using the Services on behalf of an organisation, you represent that you have authority to bind that organisation.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">2. Your Account</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must immediately notify us of any unauthorised access to your account.</li>
            <li>You may not share your account credentials with others or transfer your account.</li>
            <li>You must provide accurate information when creating your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Use the Services for any unlawful or fraudulent purpose</li>
            <li>Harass, abuse, threaten, or impersonate others</li>
            <li>Post or distribute malware, spam, or harmful content</li>
            <li>Attempt to gain unauthorised access to our systems or other users&apos; accounts</li>
            <li>Scrape, crawl, or extract data from our Services without permission</li>
            <li>Violate any applicable law or regulation</li>
          </ul>
          <p className="mt-3">
            See our full <a href="/acceptable-use" className="text-[#dfff00] hover:underline">Acceptable Use Policy</a> for a complete list of prohibited activities.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">4. Wallet & Financial Features</h2>
          <p>Our wallet and UPI features are subject to additional terms:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Wallet balances are maintained in our double-entry ledger system.</li>
            <li>All UPI transactions are executed through the UPI intent protocol and are governed by NPCI regulations.</li>
            <li>We are not a bank or financial institution. The wallet is a convenience feature, not a regulated deposit account.</li>
            <li>We are not liable for failed UPI transactions due to third-party payment app errors.</li>
            <li>Transaction disputes must be reported within 30 days of the transaction date.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">5. User Content</h2>
          <p>
            You retain ownership of content you create on WeEverything (moments, messages, notes, etc.).
            By posting content, you grant us a worldwide, non-exclusive, royalty-free licence to host, display,
            and transmit that content as necessary to provide the Services.
          </p>
          <p className="mt-3">
            You are solely responsible for content you post. You must not post content that is illegal, defamatory,
            obscene, or violates third-party rights. We reserve the right to remove content that violates our{' '}
            <a href="/community-guidelines" className="text-[#dfff00] hover:underline">Community Guidelines</a>.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">6. Intellectual Property</h2>
          <p>
            The WeEverything platform, branding, and original software are owned by WeEverything Technologies
            and are protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer
            any part of our Services without our explicit written permission.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">7. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for violations of these Terms or our Community Guidelines,
            or if we reasonably believe your account poses a security risk. You may close your account at any time
            from the Settings page. Upon termination, your right to use the Services ceases immediately.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">8. Disclaimers</h2>
          <p>
            THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
            WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">9. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEEVERYTHING TECHNOLOGIES SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICES.
            OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID US
            IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction
            of the courts located in India.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">11. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. We will notify you of material changes via email or in-app notice.
            Continued use of the Services after the effective date constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">12. Contact</h2>
          <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] font-mono text-xs space-y-1">
            <p className="text-white">WeEverything Technologies</p>
            <p>Email: <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a></p>
          </div>
        </section>
      </div>
    </article>
  );
}
