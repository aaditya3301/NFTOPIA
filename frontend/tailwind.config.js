/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        forge: {
          primary: '#0EA5A1',
          secondary: '#F97316',
          dark: '#07111A',
          card: '#0D1B26',
          border: '#183041',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
          muted: '#89A0B5'
        }
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body: ['General Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'forge-gradient': 'linear-gradient(135deg, #0EA5A1 0%, #F97316 100%)',
        'mesh-glow': 'radial-gradient(circle at 20% 20%, rgba(14,165,161,.2) 0%, rgba(7,17,26,0) 50%), radial-gradient(circle at 80% 10%, rgba(249,115,22,.2) 0%, rgba(7,17,26,0) 45%), linear-gradient(160deg, #07111A 0%, #0B1622 100%)'
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.2s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        reveal: 'reveal .8s ease-out both'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 rgba(14,165,161,0.15)' },
          '50%': { boxShadow: '0 0 28px rgba(14,165,161,0.45)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};

