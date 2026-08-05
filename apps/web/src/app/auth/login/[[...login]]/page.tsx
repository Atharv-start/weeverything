'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <div className="glass-card p-6 rounded-2xl glow-neon">
        <SignIn
          path="/auth/login"
          signUpUrl="/auth/register"
          forceRedirectUrl="/home"
          appearance={{
            elements: {
              formButtonPrimary: 'btn-neon w-full',
              card: 'bg-transparent shadow-none border-none',
              headerTitle: 'text-[var(--color-text)] font-extrabold font-display',
              headerSubtitle: 'text-[var(--color-text-muted)] text-sm font-mono',
              socialButtonsBlockButton: 'btn-glass text-[var(--color-text)]',
              dividerText: 'text-[var(--color-text-muted)] font-mono text-xs',
              formFieldLabel: 'text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-wider font-mono',
              formFieldInput: 'input-neon',
              footerActionText: 'text-[var(--color-text-muted)] font-mono text-xs',
              footerActionLink: 'text-[var(--color-primary)] font-mono font-bold hover:underline',
            }
          }}
        />
      </div>
    </div>
  );
}
