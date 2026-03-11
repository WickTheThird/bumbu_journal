/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ide-bg': '#0f172a',
        'ide-surface': '#1e293b',
        'ide-border': '#334155',
        'ide-accent': '#8b5cf6',
        'ide-accent-glow': '#a78bfa',
        'ide-text': '#f1f5f9',
        'ide-muted': '#94a3b8',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
