import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        taxi: '#F5C518',
        navy: '#12151C',
        brand: { DEFAULT: '#F04A18', dark: '#D83E10' },
        ink: '#111827',
        muted: '#667085',
        canvas: '#FAFAF8',
        success: '#16A34A',
        danger: '#DC2626',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 24, 39, 0.06), 0 8px 24px rgba(17, 24, 39, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
