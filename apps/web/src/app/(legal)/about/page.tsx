import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn about WeEverything — our mission, platform, and the technology behind India's super-app ecosystem.",
};

const FAQ_ITEMS = [
  {
    question: 'What is WeEverything?',
    answer: (
      <>
        <p>WeEverything is a unified digital super-app that brings together messaging, UPI payments, social moments, workspace collaboration, and 15+ mini-apps into a single platform.</p>
        <p className="mt-2">Think of it as your one app for everything — no more juggling between WhatsApp, Google Pay, Twitter, Notion, and separate utility apps.</p>
      </>
    ),
  },
  {
    question: 'How does the Super App work?',
    answer: (
      <p>WeEverything runs as a single unified application with a sidebar navigation giving you instant access to all features. Mini Apps run inside the main app (like WeChat&apos;s mini programs), so you never need to install separate apps for basic utilities, payments, or entertainment.</p>
    ),
  },
  {
    question: 'How do accounts work?',
    answer: (
      <>
        <p>You can sign in using Clerk authentication (Google, email, phone) or use the native email/password system. Your account is secured with JWT tokens, Argon2id password hashing, and rotating refresh tokens.</p>
        <p className="mt-2">Guest access is also available — explore the platform without creating an account.</p>
      </>
    ),
  },
  {
    question: 'How does Mini Apps work?',
    answer: <p>Mini Apps are lightweight utilities that run inside WeEverything without requiring separate installation. The App Store lets you browse and launch mini-apps for calculators, currency converters, QR scanners, Indian government services (DigiLocker, UMANG), entertainment, and more.</p>,
  },
  {
    question: 'How does messaging work?',
    answer: <p>WeEverything Chats supports direct and group messaging with real-time delivery via Socket.IO. Messages are stored securely and only accessible to conversation participants.</p>,
  },
  {
    question: 'How does the wallet work?',
    answer: <p>The WeEverything Wallet supports UPI-based payments, expense tracking, and a double-entry ledger. You can send money, track spending categories, and view transaction history. Wallet data is private and only visible to you.</p>,
  },
  {
    question: 'How is user data handled?',
    answer: (
      <>
        <p>We collect only what is necessary to operate the platform. We never sell personal data. See our <Link href="/privacy" className="text-[#dfff00] hover:underline">Privacy Policy</Link> for full details.</p>
        <p className="mt-2">Optional analytics are only loaded with your consent via the cookie consent banner.</p>
      </>
    ),
  },
  {
    question: 'Is WeEverything free?',
    answer: <p>Yes — WeEverything is free to use. Core features including messaging, moments, wallet, workspace, and mini-apps are available without payment. Future premium features may be introduced with clear opt-in pricing.</p>,
  },
  {
    question: 'How do users control their privacy?',
    answer: <p>You can manage your privacy settings from the Settings page, control what data is visible on your profile, opt out of analytics via the cookie preferences, and request account deletion via the contact form.</p>,
  },
  {
    question: 'How do I report content or a user?',
    answer: <p>Use the report button on any post, moment, or profile. Reports are reviewed by our moderation team. See our <Link href="/community-guidelines" className="text-[#dfff00] hover:underline">Community Guidelines</Link> for details on prohibited content.</p>,
  },
  {
    question: 'How do I delete my account?',
    answer: <p>Go to Settings → Account → Delete Account. Account deletion is permanent and removes all your personal data, posts, and messages in accordance with our <Link href="/data-retention" className="text-[#dfff00] hover:underline">Data Retention Policy</Link>. You can also contact us at <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a>.</p>,
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.question },
  })),
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <article className="prose-legal">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Company</span>
          <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">About WeEverything</h1>
          <p className="font-mono text-xs text-[#555555]">Our mission, platform, and values</p>
        </div>

        <div className="space-y-10 font-body text-sm text-[#aaaaaa] leading-relaxed">
          <section>
            <h2 className="text-white font-display font-bold text-2xl mb-3">One App For Everything</h2>
            <p className="text-base leading-relaxed">
              WeEverything is a unified digital super-app platform that brings together the tools you use every day —
              messaging, payments, social media, productivity, and AI utilities — into a single, beautifully integrated experience.
            </p>
            <p className="mt-4">
              We believe that digital life should be seamless. That switching between a dozen apps to get through your day
              is a problem worth solving. WeEverything is our answer.
            </p>
          </section>

          <section>
            <h2 className="text-white font-display font-bold text-xl mb-4">What We Build</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: 'chat_bubble', title: 'Instant Messaging', desc: 'End-to-end encrypted real-time chat with direct messages and group conversations.' },
                { icon: 'account_balance_wallet', title: 'UPI Payments', desc: 'Send money instantly via UPI, track expenses, and manage your wallet ledger.' },
                { icon: 'auto_awesome', title: 'Social Feed', desc: 'Share moments, follow connections, and discover content from your network.' },
                { icon: 'dashboard', title: 'Team Workspace', desc: 'Manage projects, assign tasks, collaborate with your team, and stay organised.' },
                { icon: 'apps', title: 'Mini Apps', desc: 'A growing ecosystem of productivity, entertainment, and utility mini-applications.' },
                { icon: 'psychology', title: 'AI Tools', desc: 'Multilingual voice AI, writing assistant, and smart features across the platform.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] flex gap-3">
                  <span className="material-symbols-outlined text-[#dfff00] flex-shrink-0 text-xl">{icon}</span>
                  <div>
                    <h3 className="text-white font-mono text-sm font-bold mb-1">{title}</h3>
                    <p className="text-[#888888] text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-white font-display font-bold text-xl mb-3">Our Technology</h2>
            <p>WeEverything is built on a modern, production-grade technology stack designed for reliability, security, and scale:</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left py-3 pr-6 text-[#dfff00] uppercase tracking-wider">Layer</th>
                    <th className="text-left py-3 text-[#dfff00] uppercase tracking-wider">Technology</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]">
                  {[
                    ['Frontend', 'Next.js 15, React 19, TypeScript, Tailwind CSS'],
                    ['Backend', 'NestJS, TypeScript, REST API'],
                    ['Real-time', 'Socket.IO 4'],
                    ['Database', 'PostgreSQL 16 via Prisma 6'],
                    ['Cache', 'Redis 7'],
                    ['Auth', 'Clerk + JWT (rotating refresh tokens, Argon2id)'],
                    ['Monorepo', 'pnpm workspaces + Turborepo'],
                  ].map(([layer, tech]) => (
                    <tr key={layer}>
                      <td className="py-2 pr-6 text-white">{layer}</td>
                      <td className="py-2 text-[#aaaaaa]">{tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-white font-display font-bold text-xl mb-3">Our Values</h2>
            <div className="space-y-3">
              {[
                { title: 'Privacy First', desc: 'We collect only what is necessary. We never sell your personal data. You own your content.' },
                { title: 'Security as a Foundation', desc: 'Security is not an afterthought — it is designed in from day one, from the database to the UI.' },
                { title: 'Honest Design', desc: 'We do not use dark patterns, fake social proof, or artificial urgency. Everything you see is real.' },
                { title: 'Open Building', desc: 'We are transparent about how the platform works and welcome community feedback.' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                  <span className="material-symbols-outlined text-[#dfff00] flex-shrink-0">check_circle</span>
                  <div>
                    <p className="text-white font-mono text-sm font-bold">{title}</p>
                    <p className="text-[#888888] text-xs mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <FAQAccordion title="Frequently Asked Questions" items={FAQ_ITEMS} />
          </section>

          <section>
            <h2 className="text-white font-display font-bold text-xl mb-3">Get In Touch</h2>
            <p>We&apos;d love to hear from you — whether it&apos;s feedback, a support request, or a partnership inquiry.</p>
            <div className="mt-4 flex gap-3 flex-wrap">
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-[#dfff00] text-black font-mono text-xs font-bold hover:bg-[#c8e600] transition-colors"
              >
                Contact Us
              </Link>
              <a
                href="mailto:support@weeverything.app"
                className="px-5 py-2.5 rounded-xl border border-[#1a1a1a] text-[#aaaaaa] font-mono text-xs font-bold hover:border-[#dfff00] hover:text-[#dfff00] transition-colors"
              >
                support@weeverything.app
              </a>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
