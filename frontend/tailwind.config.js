/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#FFF3B0',
          dark: '#B8860B',
        },
        dark: {
          bg: '#0A0C10',
          card: 'rgba(18, 22, 32, 0.85)',
          surface: '#121620'
        }
      }
    },
  },
  plugins: [],
}
