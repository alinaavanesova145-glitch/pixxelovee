import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        oled: '#000000',
        slate: { DEFAULT: '#0f1115' },
        blush: '#FFB6C1',
        neon: '#FF3EA5',
      },
      fontFamily: {
        heading: ['var(--font-fredoka)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
        pixel: ['var(--font-press-start-2p)', '"Press Start 2P"', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
