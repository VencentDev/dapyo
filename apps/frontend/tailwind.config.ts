import type { Config } from 'tailwindcss';

const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'oklch(var(--dapyo-border) / <alpha-value>)',
        input: 'oklch(var(--dapyo-input) / <alpha-value>)',
        ring: 'oklch(var(--dapyo-ring) / <alpha-value>)',
        background: 'oklch(var(--dapyo-background) / <alpha-value>)',
        foreground: 'oklch(var(--dapyo-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'oklch(var(--dapyo-primary) / <alpha-value>)',
          foreground: 'oklch(var(--dapyo-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'oklch(var(--dapyo-secondary) / <alpha-value>)',
          foreground: 'oklch(var(--dapyo-secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'oklch(var(--dapyo-destructive) / <alpha-value>)',
          foreground: 'oklch(var(--dapyo-destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'oklch(var(--dapyo-muted) / <alpha-value>)',
          foreground: 'oklch(var(--dapyo-muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'oklch(var(--dapyo-accent) / <alpha-value>)',
          foreground: 'oklch(var(--dapyo-accent-foreground) / <alpha-value>)',
          alt: 'oklch(var(--dapyo-accent-alt) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'oklch(var(--dapyo-popover) / <alpha-value>)',
          foreground: 'oklch(var(--dapyo-popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'oklch(var(--dapyo-card) / <alpha-value>)',
          foreground: 'oklch(var(--dapyo-card-foreground) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-figtree)', 'Figtree', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Geist Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--dapyo-radius)',
        md: 'var(--dapyo-radius)',
        sm: 'var(--dapyo-radius)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'aurora-flow': {
          '0%': { transform: 'translate(-10%, -10%) scale(1)' },
          '50%': { transform: 'translate(10%, 10%) scale(1.1)' },
          '100%': { transform: 'translate(-10%, -10%) scale(1)' },
        },
        'float-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        aurora: 'aurora-flow 10s infinite ease-in-out',
        'float-in': 'float-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
} satisfies Config;

export default config;
