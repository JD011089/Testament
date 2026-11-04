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
        // Semantic design tokens mapped to CSS variables (Daybreak light / Vespers dark)
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          raised: 'rgb(var(--color-surface-raised) / <alpha-value>)',
          overlay: 'rgb(var(--color-surface-raised) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          on: 'rgb(var(--color-on-accent) / <alpha-value>)',
          text: 'rgb(var(--color-accent-text) / <alpha-value>)',
          border: 'rgb(var(--color-accent-border) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          text: 'rgb(var(--color-secondary-text) / <alpha-value>)',
          on: 'rgb(var(--color-on-secondary) / <alpha-value>)',
        },
        sky: {
          50: '#F0F6FA',
          100: '#E0EDF4',
          200: '#C2DCE9',
          300: '#9ABED2',
          400: '#7FAAC6',
          500: '#5488AC',
          600: '#3A6F93',
          700: '#2E5F80',
          800: '#234760',
          900: '#1B3547',
          950: '#0F1E29',
        },
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        xp: {
          DEFAULT: 'rgb(var(--color-xp) / <alpha-value>)',
          fill: 'rgb(var(--color-xp-fill) / <alpha-value>)',
        },

        // Remapped stone scale: light end is warm parchment, dark end is night navy
        // Defines stone-250 so previously broken borders render reliably.
        // stone-400/500 are theme-driven greys so dark mode no longer reuses the
        // light browns (#76695A / #645749) that fell to 2.1-3.4:1 on navy.
        stone: {
          // Neutral linen (light end) to night lapis (dark end).
          50: '#FAF9F6',
          100: '#F3F1EB',
          150: '#ECE9E1',
          200: '#E4E0D5',
          250: '#D9D4C7',
          300: '#CBC5B6',
          400: 'rgb(var(--stone-400) / <alpha-value>)',
          500: 'rgb(var(--stone-500) / <alpha-value>)',
          600: '#3C4458',
          700: '#2C3447',
          750: '#222A3C',
          800: '#1E2742', // night lapis tone
          850: '#18213A',
          900: '#121A2E',
          950: '#0A0F1E',
        },

        // Remapped amber scale: tuned with gold accent highlights.
        // amber-500 is theme-driven so flat-gold buttons/accents stop reusing
        // the light-theme gold (#D49D5F) in dark mode; dark renders #E4B879.
        amber: {
          // Accent scale, theme-driven: lapis blue in light, gold in dark (see index.css).
          50: 'rgb(var(--amber-50) / <alpha-value>)',
          100: 'rgb(var(--amber-100) / <alpha-value>)',
          200: 'rgb(var(--amber-200) / <alpha-value>)',
          300: 'rgb(var(--amber-300) / <alpha-value>)',
          400: 'rgb(var(--amber-400) / <alpha-value>)',
          500: 'rgb(var(--amber-500) / <alpha-value>)',
          600: 'rgb(var(--amber-600) / <alpha-value>)',
          700: 'rgb(var(--amber-700) / <alpha-value>)',
          800: 'rgb(var(--amber-800) / <alpha-value>)',
          900: 'rgb(var(--amber-900) / <alpha-value>)',
          950: 'rgb(var(--amber-950) / <alpha-value>)',
        },

        // Parchment scale
        parchment: {
          50: '#F8F4EA',
          100: '#EEE7D6',
          200: '#E2DBC9',
          300: '#CFC8B6',
          400: '#B5AE9E',
          500: '#99927F',
          800: '#2B2F3A',
          900: '#1A1E28',
          950: '#0E1119',
        },

        // Iron / Ink scale (night navy Vesper palette)
        iron: {
          700: '#243052',
          800: '#18213A',
          850: '#141D33',
          900: '#121A2E',
          950: '#0A0F1E',
        },
        ink: {
          DEFAULT: '#0D1325',
          raised: '#141D33',
          overlay: '#18213A',
        },

        // Ember / bronze accents
        ember: {
          400: '#E8C070',
          500: '#E2B65E',
          600: '#C99A40',
          700: '#A27A2E',
        },
        bronze: {
          400: '#E8C070',
          500: '#E2B65E',
          600: '#B8862B',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
        display: ['Cinzel', 'Georgia', 'Cambria', 'serif'],
        reading: ['Lora', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgb(var(--color-accent) / 0.30)',
        'glow-ember': '0 0 25px -5px rgb(var(--color-accent) / 0.30)',
        'glow-gold': '0 0 25px -5px rgb(var(--color-accent) / 0.30)',
        'glow-amber': '0 0 25px -5px rgb(var(--color-accent) / 0.30)',
      }
    },
  },
  plugins: [],
}
