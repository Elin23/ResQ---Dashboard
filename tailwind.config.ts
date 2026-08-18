import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--color-background) / <alpha-value>)',
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        'surface-subtle': 'hsl(var(--color-surface-subtle) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--color-muted-foreground) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        'primary-foreground': 'hsl(var(--color-primary-foreground) / <alpha-value>)',
        brown: 'hsl(var(--color-brown) / <alpha-value>)',
        success: 'hsl(var(--color-success) / <alpha-value>)',
        pending: 'hsl(var(--color-pending) / <alpha-value>)',
        critical: 'hsl(var(--color-critical) / <alpha-value>)',
        info: 'hsl(var(--color-info) / <alpha-value>)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        overlay: 'var(--shadow-overlay)',
      },
      spacing: {
        sidebar: 'var(--layout-sidebar)',
        'sidebar-collapsed': 'var(--layout-sidebar-collapsed)',
        header: 'var(--layout-header)',
      },
      fontFamily: {
        sans: ['Tajawal', 'Noto Sans Arabic', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
