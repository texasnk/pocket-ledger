import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { fontFamily: { lato: ['Lato', 'sans-serif'] } } },
  plugins: []
} satisfies Config;
