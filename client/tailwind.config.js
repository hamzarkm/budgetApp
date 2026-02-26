/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Anthropic Sans', 'system-ui', 'sans-serif'],
        mono: ['Anthropic Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
          input: 'var(--bg-input)',
        },
        border: {
          DEFAULT: 'var(--border)',
          hover: 'var(--border-hover)',
          focus: '#6366f1',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          purple: '#7c3aed',
          blue: '#4f46e5',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          green: '#10b981',
          red: '#ef4444',
          orange: '#f59e0b',
          yellow: '#eab308',
          pink: '#ec4899',
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        soft: '0 2px 8px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};
