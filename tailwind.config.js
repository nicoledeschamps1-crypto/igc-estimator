/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        igc: {
          purple: '#8B45E8',
          'purple-dark': '#6B2EC5',
          'purple-light': '#F4F0FA',
          ink: '#1A1A1A',
          muted: '#6B6B6B',
          line: '#E6E0F0',
          bg: '#FAFAFA',
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
