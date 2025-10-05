import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ===== LINEAR-INSPIRED COLOR SYSTEM ===== */
      colors: {
        /* Legacy support - backward compatible */
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        /* Neutral palette - Linear style */
        neutral: {
          950: 'var(--neutral-950)',
          900: 'var(--neutral-900)',
          800: 'var(--neutral-800)',
          700: 'var(--neutral-700)',
          600: 'var(--neutral-600)',
          500: 'var(--neutral-500)',
          400: 'var(--neutral-400)',
          300: 'var(--neutral-300)',
          200: 'var(--neutral-200)',
          100: 'var(--neutral-100)',
          50: 'var(--neutral-50)',
        },

        /* Brand colors */
        brand: {
          600: 'var(--brand-600)',
          500: 'var(--brand-500)',
          400: 'var(--brand-400)',
          300: 'var(--brand-300)',
        },

        /* UI semantic colors */
        ui: {
          bg: 'var(--ui-bg)',
          surface: 'var(--ui-surface)',
          'surface-hover': 'var(--ui-surface-hover)',
          border: 'var(--ui-border)',
          'border-hover': 'var(--ui-border-hover)',
          text: 'var(--ui-text)',
          'text-secondary': 'var(--ui-text-secondary)',
          'text-muted': 'var(--ui-text-muted)',
          'text-disabled': 'var(--ui-text-disabled)',
        },

        /* Semantic colors */
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--info)',
      },

      /* ===== BORDER RADIUS ===== */
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      /* ===== BOX SHADOW - Soft & Subtle ===== */
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },

      /* ===== SPACING ===== */
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
      },

      /* ===== TYPOGRAPHY ===== */
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },

      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
      },

      /* ===== TRANSITIONS ===== */
      transitionDuration: {
        fast: 'var(--transition-fast)',
        DEFAULT: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
    },
  },
  plugins: [],
}
export default config
