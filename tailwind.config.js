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
          50: '#FBF8F1',
          100: '#F6EEDD',
          150: '#EFE3CC',
          200: '#E7D7BA',
          250: '#DECBA8',
          300: '#D5BF97',
          400: 'rgb(var(--stone-400) / <alpha-value>)', // #76695A light / #A89C86 dark
          500: 'rgb(var(--stone-500) / <alpha-value>)', // #645749 light / #9C9483 dark
          600: '#53483C',
          700: '#433A31',
          750: '#383028',
          800: '#2D3446', // night navy tone
          850: '#232A3B',
          900: '#1A1F2D',
          950: '#131722',
        },

        // Remapped amber scale: tuned with gold accent highlights.
        // amber-500 is theme-driven so flat-gold buttons/accents stop reusing
        // the light-theme gold (#D49D5F) in dark mode; dark renders #E4B879.
        amber: {
          50: '#FFFDF8',
          100: '#FFF5E0',
          200: '#FCE7BF',
          300: '#F7D69B',
          400: '#EDCB93',
          500: 'rgb(var(--amber-500) / <alpha-value>)', // #D49D5F light / #E4B879 dark
          600: '#8A5424', // Passed AA contrast (replaces low-contrast #d97706 on light)
          700: '#A04E14',
          800: '#783A0E',
          900: '#552809',
          950: '#381A05',
        },

        // Parchment scale
        parchment: {
          50: '#FFFDF8',
          100: '#F8F1E0',
          200: '#F3EAD3',
          300: '#E7D7BA',
          400: '#C9BEA6',
          500: '#AD9E82',
          800: '#3C3127',
          900: '#231D17',
          950: '#14100C',
        },

        // Iron / Ink scale (night navy Vesper palette)
        iron: {
          700: '#333B50',
          800: '#232A3B',
          850: '#1E2433',
          900: '#1A1F2D',
          950: '#131722',
        },
        ink: {
          DEFAULT: '#131722',
          raised: '#1A1F2D',
          overlay: '#232A3B',
        },

        // Ember / bronze accents
        ember: {
          400: '#F0A35E',
          500: '#D49D5F',
          600: '#C38A4B',
          700: '#A04E14',
        },
        bronze: {
          400: '#E4B879',
          500: '#D49D5F',
          600: '#B27B3F',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
        display: ['Cinzel', 'Georgia', 'Cambria', 'serif'],
        reading: ['Lora', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(212, 157, 95, 0.30)',
        'glow-ember': '0 0 25px -5px rgba(212, 157, 95, 0.30)',
        'glow-gold': '0 0 25px -5px rgba(212, 157, 95, 0.30)',
        'glow-amber': '0 0 25px -5px rgba(212, 157, 95, 0.30)',
      }
    },
  },
  plugins: [],
}
