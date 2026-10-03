/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8ddce',
          300: '#d7c4af',
          400: '#c0a388',
          500: '#ad8769',
          800: '#3c3127',
          900: '#231d17',
          950: '#14100c',
        },
        iron: {
          800: '#1e232a',
          850: '#161a20',
          900: '#0f1217',
          950: '#090b0e',
        },
        surface: {
          DEFAULT: '#fcfbfa',
          raised: '#ffffff',
          overlay: '#f4f0e8',
        },
        ink: {
          DEFAULT: '#090b0e',
          raised: '#12151a',
          overlay: '#1a1f28',
        },
        ember: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        bronze: {
          400: '#d97706',
          500: '#b45309',
          600: '#92400e',
        },
        stone: {
          850: '#161920',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
        display: ['Cinzel', 'Georgia', 'Cambria', 'serif'],
        reading: ['Lora', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(180, 83, 9, 0.28)',
        'glow-ember': '0 0 25px -5px rgba(180, 83, 9, 0.28)',
        'glow-gold': '0 0 25px -5px rgba(180, 83, 9, 0.28)',
        'glow-amber': '0 0 25px -5px rgba(180, 83, 9, 0.28)',
      }
    },
  },
  plugins: [],
}
