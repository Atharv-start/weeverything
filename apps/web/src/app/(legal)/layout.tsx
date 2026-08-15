import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | WeEverything',
    default: 'Legal | WeEverything',
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e2e1]">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#dfff00] focus:text-[#050505] focus:font-mono focus:text-xs focus:font-bold focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#050505]/95 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/home" className="font-display text-xl font-extrabold tracking-tighter text-white hover:text-[#dfff00] transition-colors">
            WeEverything
          </Link>
          <div className="flex items-center gap-4 font-mono text-xs text-[#888888]">
            <Link href="/home" className="hover:text-[#dfff00] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-6 py-12 outline-none">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-10 mt-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="font-mono text-xs text-[#555555]">
              &copy; {new Date().getFullYear()} WeEverything Technologies. All rights reserved.
            </div>
            <nav className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#555555]">
              <Link href="/privacy" className="hover:text-[#dfff00] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#dfff00] transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-[#dfff00] transition-colors">Cookie Policy</Link>
              <Link href="/community-guidelines" className="hover:text-[#dfff00] transition-colors">Community Guidelines</Link>
              <Link href="/acceptable-use" className="hover:text-[#dfff00] transition-colors">Acceptable Use</Link>
              <Link href="/security" className="hover:text-[#dfff00] transition-colors">Security</Link>
              <Link href="/contact" className="hover:text-[#dfff00] transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
