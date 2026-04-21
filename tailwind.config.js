/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        igc: {
          purple: '#8B45E8',
          'purple-dark': '#6B2EC5',
          'purple-light': 'rgb(var(--igc-purple-light) / <alpha-value>)',
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
        mono: ['Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
