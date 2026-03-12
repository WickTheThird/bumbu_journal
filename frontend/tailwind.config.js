/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk void backgrounds
        'ide-bg': '#0A0A0F',
        'ide-surface': '#12101A',
        'ide-border': '#1E1A2E',
        
        // Neon accents
        'ide-accent': '#A855F7',
        'ide-accent-glow': '#C084FC',
        'neon-green': '#39FF14',
        'neon-cyan': '#00F5FF',
        'neon-magenta': '#FF00FF',
        'neon-purple': '#A855F7',
        
        // Text
        'ide-text': '#E0E0E0',
        'ide-muted': '#6B7280',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Share Tech Mono', 'monospace'],
        sans: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-purple': '0 0 5px #A855F7, 0 0 10px #A855F7',
        'neon-green': '0 0 5px #39FF14, 0 0 10px #39FF14',
        'neon-cyan': '0 0 5px #00F5FF, 0 0 10px #00F5FF',
      },
    },
  },
  plugins: [],
}
