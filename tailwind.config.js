/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#121212',
          surface: '#1A1A1A',
          elevated: '#242424',
          overlay: '#2E2E2E',
        },
        text: {
          primary: '#F3F4F6',
          secondary: '#9CA3AF',
          muted: '#5A5A6A',
        },
        accent: {
          income: '#34D399',
          expense: '#FB7185',
          'income-dim': 'rgba(52,211,153,0.10)',
          'expense-dim': 'rgba(251,113,133,0.10)',
          blue: '#60A5FA',
          yellow: '#FBBF24',
          purple: '#A78BFA',
          sociabuzz: '#7B5CF5',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.14)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      animation: {
        /* Entrances */
        'fade-in':       'fadeIn 0.22s ease-out both',
        'fade-in-up':    'fadeInUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-down':  'fadeInDown 0.25s ease-out both',
        'scale-in':      'scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up':      'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'slide-right':   'slideRight 0.3s cubic-bezier(0.22,1,0.36,1) both',
        /* Continuous */
        'spin-slow':     'spin 3s linear infinite',
        'pulse-soft':    'pulseSoft 2.5s ease-in-out infinite',
        'shimmer':       'shimmer 1.8s linear infinite',
        'float':         'float 3s ease-in-out infinite',
        /* Interactions */
        'bounce-in':     'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'wiggle':        'wiggle 0.4s ease-in-out',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0 },                               to: { opacity: 1 } },
        fadeInUp:    { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeInDown:  { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:     { from: { opacity: 0, transform: 'scale(0.88)' },     to: { opacity: 1, transform: 'scale(1)' } },
        slideUp:     { from: { opacity: 0, transform: 'translateY(28px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideRight:  { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseSoft:   { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        shimmer:     { from: { backgroundPosition: '-200% center' }, to: { backgroundPosition: '200% center' } },
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        bounceIn:    { '0%': { transform: 'scale(0.3)', opacity: 0 }, '60%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        wiggle:      { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-6deg)' }, '75%': { transform: 'rotate(6deg)' } },
        glowPulse:   { '0%,100%': { boxShadow: '0 0 12px rgba(52,211,153,0.2)' }, '50%': { boxShadow: '0 0 28px rgba(52,211,153,0.45)' } },
      },
      boxShadow: {
        'card':         '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.7)',
        'float':        '0 8px 32px rgba(0,0,0,0.65)',
        'glow-income':  '0 0 20px rgba(52,211,153,0.22)',
        'glow-expense': '0 0 20px rgba(251,113,133,0.22)',
        'glow-purple':  '0 0 20px rgba(167,139,250,0.22)',
        'glow-sociabuzz': '0 0 20px rgba(123,92,245,0.35)',
        'elevated':     '0 4px 24px rgba(0,0,0,0.5)',
        'inner-glow':   'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      transitionTimingFunction: {
        'spring':  'cubic-bezier(0.34,1.56,0.64,1)',
        'smooth':  'cubic-bezier(0.22,1,0.36,1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}
