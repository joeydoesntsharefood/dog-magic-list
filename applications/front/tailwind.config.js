/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Tokens linked to CSS variables
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        
        // Status Tokens
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',

        // Mana/Magic specific tokens (fixed for consistency)
        'mtg-white': '#F9FAF4',
        'mtg-blue': '#0E68AB',
        'mtg-black': '#150B00',
        'mtg-red': '#D3202A',
        'mtg-green': '#00733E',
        'mtg-colorless': '#A69F9D',

        // Legacy palette support
        'tattoo-red': '#8A3A34',
        'aged-bronze': '#9E8C6A',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        display: ['var(--font-display)', 'serif'],
      },
      animation: {
        'glitch-color': 'glitch-color 2s infinite',
      },
      keyframes: {
        'glitch-color': {
          '0%, 100%': { color: 'var(--color-primary)' },
          '33%': { color: 'var(--color-accent)' },
          '66%': { color: '#ffffff' },
        }
      }
    },
  },
  plugins: [],
}
