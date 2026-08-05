import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'WeEverything Cookie Policy — how and why we use cookies on our platform.',
};

export default function CookiesPage() {
  return (
    <article className="prose-legal">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Legal</span>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">Cookie Policy</h1>
        <p className="font-mono text-xs text-[#555555]">Last updated: August 2, 2026</p>
      </div>

      <div className="space-y-10 font-body text-sm text-[#aaaaaa] leading-relaxed">
        <section>
          <p>
            This Cookie Policy explains how WeEverything Technologies uses cookies and similar tracking technologies
            on <span className="text-[#dfff00]">weeverything.app</span>. By continuing to use our platform, you consent to our use of cookies as described here.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help websites remember
            information about your visit to improve performance, personalise your experience, and enable certain features.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">2. Types of Cookies We Use</h2>

          <div className="space-y-4 mt-3">
            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
              <h3 className="text-[#dfff00] font-mono text-sm font-bold mb-1">Essential Cookies</h3>
              <p>Required for the platform to function. These include authentication tokens (JWT session management via Clerk), CSRF protection tokens, and theme preferences. These cannot be disabled.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
              <h3 className="text-[#dfff00] font-mono text-sm font-bold mb-1">Functional Cookies</h3>
              <p>Used to remember your preferences such as language, theme (dark/light/system), and notification settings.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
              <h3 className="text-[#dfff00] font-mono text-sm font-bold mb-1">Analytics Cookies</h3>
              <p>Help us understand how users interact with the platform so we can improve the experience. These may be provided by third-party analytics tools. You can opt out of analytics in your account settings.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">3. Local Storage</h2>
          <p>
            In addition to cookies, we use browser local storage to persist application state between sessions
            (e.g., draft posts, UI preferences). This data is stored only on your device and is not transmitted to our servers.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">4. Managing Cookies</h2>
          <p>
            Most browsers allow you to control cookie settings through their settings menus. You can:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>View and delete existing cookies</li>
            <li>Block all or certain types of cookies</li>
            <li>Set preferences for specific websites</li>
          </ul>
          <p className="mt-3">
            Please note that disabling essential cookies will prevent you from logging in and using core features of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">5. Third-Party Cookies</h2>
          <p>
            Some third-party services integrated into WeEverything may set their own cookies. These include:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Clerk (authentication) — governed by Clerk&apos;s privacy policy</li>
            <li>Google Fonts — for typography delivery</li>
          </ul>
          <p className="mt-3">We do not control third-party cookies and encourage you to review their respective policies.</p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">6. Contact</h2>
          <p>Questions about our cookie practices? Contact us at{' '}
            <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
