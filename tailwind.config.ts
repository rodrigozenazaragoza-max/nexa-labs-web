import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        'primary-light': 'var(--color-primary-light)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        warn: 'var(--color-warn)',
        'warn-bg': 'var(--color-warn-bg)',
        danger: 'var(--color-danger)',
        'danger-bg': 'var(--color-danger-bg)',
        sale: 'var(--color-sale)',
        accent: 'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      fontSize: {
        hero: 'var(--text-hero)',
        h2: 'var(--text-h2)',
        h3: 'var(--text-h3)',
        small: 'var(--text-small)',
      },
      borderRadius: {
        theme: 'var(--radius)',
      },
    },
  },
  plugins: [],
};
export default config;
