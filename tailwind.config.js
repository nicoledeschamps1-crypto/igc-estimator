/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        igc: {
          // Primary accent — cobalt blue from igcstudio.com (papi's brand blue)
          accent: '#0955A6',
          'accent-dark': '#073F7D',
          'accent-light': 'rgb(var(--igc-accent-light) / <alpha-value>)',
          // Secondary accent — dusty rose from igcstudio.com (used sparingly for highlights)
          rose: '#CC3366',
          // Theme-aware tokens (CSS-variable-backed)
          ink: 'rgb(var(--igc-ink) / <alpha-value>)',
          muted: 'rgb(var(--igc-muted) / <alpha-value>)',
          line: 'rgb(var(--igc-line) / <alpha-value>)',
          bg: 'rgb(var(--igc-bg) / <alpha-value>)',
          surface: 'rgb(var(--igc-surface) / <alpha-value>)',
          'surface-2': 'rgb(var(--igc-surface-2) / <alpha-value>)',
          warn: '#E8B045',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
        display: ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
