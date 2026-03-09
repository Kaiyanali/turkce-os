import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        surface: '#1A1A1A',
        'surface-light': '#2A2A2A',
        amber: '#D4A843',
        'amber-light': '#E8C96A',
        'amber-dim': '#2A2000',
        teal: '#1B6B6B',
        'teal-light': '#238F8F',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
