import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Retention Policy',
  description: 'WeEverything Data Retention Policy — how long we keep your data and how to request deletion.',
};

export default function DataRetentionPage() {
  return (
    <article className="prose-legal">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase font-bold text-[#dfff00] tracking-widest">Legal</span>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2 mb-2">Data Retention Policy</h1>
        <p className="font-mono text-xs text-[#555555]">Last updated: August 2, 2026</p>
      </div>

      <div className="space-y-10 font-body text-sm text-[#aaaaaa] leading-relaxed">
        <section>
          <p>
            This Data Retention Policy explains how long WeEverything Technologies retains different categories of
            personal data and how you can request early deletion of your data.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">1. Retention Periods by Data Category</h2>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs mt-3 border-collapse">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left py-3 pr-6 text-[#dfff00] uppercase tracking-wider">Data Category</th>
                  <th className="text-left py-3 pr-6 text-[#dfff00] uppercase tracking-wider">Retention Period</th>
                  <th className="text-left py-3 text-[#dfff00] uppercase tracking-wider">Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]">
                {[
                  ['Account data', 'Duration of account + 30 days after deletion', 'Contract performance'],
                  ['Profile information', 'Duration of account', 'Contract performance'],
                  ['Messages & chats', '12 months from creation', 'Legitimate interest'],
                  ['Moments & posts', 'Duration of account or until deleted by user', 'Contract performance'],
                  ['Wallet transactions', '7 years from transaction date', 'Legal obligation (financial records)'],
                  ['Authentication logs', '90 days', 'Security & fraud prevention'],
                  ['System & access logs', '30 days', 'Security & operational'],
                  ['Support communications', '3 years from resolution', 'Legitimate interest'],
                  ['Backup copies', 'Up to 90 days after primary deletion', 'Technical operations'],
                ].map(([cat, period, basis]) => (
                  <tr key={cat}>
                    <td className="py-3 pr-6 text-white">{cat}</td>
                    <td className="py-3 pr-6 text-[#aaaaaa]">{period}</td>
                    <td className="py-3 text-[#555555]">{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">2. Account Deletion</h2>
          <p>
            You may delete your account at any time via <strong className="text-white">Settings &rarr; Account &rarr; Delete Account</strong>.
            Upon deletion:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Your profile, moments, and messages are removed within 30 days</li>
            <li>Financial transaction records are retained for 7 years as required by law</li>
            <li>Backup copies are purged within 90 days</li>
            <li>Anonymised analytics data may be retained indefinitely</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">3. Requesting Data Deletion</h2>
          <p>
            To request deletion of specific data before the standard retention period ends, contact us at{' '}
            <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a>.
            We will respond within 30 days. Some data may be retained longer where required by law.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">4. Legal Hold</h2>
          <p>
            In cases of ongoing legal proceedings or regulatory investigations, we may retain data beyond the standard
            retention period until the matter is resolved. We will notify you when legally permitted.
          </p>
        </section>

        <section>
          <h2 className="text-white font-display font-bold text-xl mb-3">5. Data Export</h2>
          <p>
            You have the right to export your personal data before deleting your account.
            Contact us at <a href="mailto:support@weeverything.app" className="text-[#dfff00] hover:underline">support@weeverything.app</a> to request a data export.
          </p>
        </section>
      </div>
    </article>
  );
}
