/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'classic-black': '#1C1C1C',
        'parchment-creme': '#E8DCCA',
        'tattoo-red': '#8A3A34',
        'leather-brown': '#6E5C49',
        'dog-skin-beige': '#B9AA95',
        'aged-bronze': '#9E8C6A',
        'metallic-gray': '#A0A0A0',
      }
    },
  },
  plugins: [],
}
