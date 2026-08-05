/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        'surface-container': 'var(--color-surface-container)',
        'surface-dim': 'var(--color-surface-dim)',
        'surface-bright': 'var(--color-surface-bright)',
        'on-surface': 'var(--color-text)',
        'on-surface-variant': 'var(--color-text-muted)',
        
        // Neon Primary System (Single Unified Accent Color)
        primary: {
          DEFAULT: '#dfff00',
          hover: '#e8ff33',
          dim: 'rgba(223, 255, 0, 0.12)',
          glow: 'rgba(223, 255, 0, 0.25)',
          fixed: '#dfff00',
          'fixed-dim': '#b8d300',
          container: '#d2f000',
          'on-container': '#191e00',
        },
        
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
          active: 'var(--color-border-active)',
        },
        
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
          inverse: 'var(--color-text-inverse)',
        },

        secondary: '#c6c6c7',
        tertiary: '#ffffff',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
      },
      fontFamily: {
        headline: ['Hanken Grotesk', 'sans-serif'],
        display: ['Hanken Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        'label-caps': ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        base: '4px',
        gutter: '16px',
        'margin-mobile': '20px',
        'margin-desktop': '48px',
        'container-max': '1280px',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(223, 255, 0, 0.25)',
        'neon-lg': '0 0 30px rgba(223, 255, 0, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        glass: '14px',
        'glass-strong': '24px',
      },
    },
  },
  plugins: [],
};
