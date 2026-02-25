/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0a0a0f',
          card: '#12121a',
          hover: '#1a1a25',
          input: '#16161f',
        },
        border: {
          DEFAULT: '#1e1e2e',
          hover: '#2a2a3d',
          focus: '#6366f1',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#8b8ba3',
          muted: '#555570',
        },
        accent: {
          purple: '#8b5cf6',
          blue: '#6366f1',
          indigo: '#818cf8',
          cyan: '#22d3ee',
          green: '#34d399',
          red: '#f87171',
          orange: '#fb923c',
          yellow: '#fbbf24',
          pink: '#f472b6',
        },
      },
    },
  },
  plugins: [],
};
