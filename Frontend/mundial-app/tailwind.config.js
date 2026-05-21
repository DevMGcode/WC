/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],

  safelist: [
    // Backgrounds
    { pattern: /^bg-orionix-/ },
    // Text
    { pattern: /^text-orionix-/ },
    // Borders
    { pattern: /^border-orionix-/ },
    { pattern: /^border-green-/ },
    { pattern: /^border-gold-/ },
    // Shadows
    { pattern: /^shadow-(green|gold|premium)/ },
    // Placeholder
    { pattern: /^placeholder-orionix-/ },
  ],

  theme: {
    extend: {
      colors: {
        orionix: {
          bg: {
            primary: '#050D07',
            secondary: '#08170D',
            elevated: '#0E2214',
            soft: '#14311C',
          },

          green: {
            dark: '#1B5E20',
            DEFAULT: '#2E7D32',
            hover: '#388E3C',
            bright: '#4CAF50',
            soft: '#A5D6A7',
            muted: '#7CBF7F',
          },

          gold: {
            dark: '#8C6A16',
            muted: '#C9A227',
            DEFAULT: '#D4AF37',
            bright: '#E2C760',
            soft: '#F1DB91',
          },

          text: {
            primary: '#F5F7FA',
            secondary: '#B8C4BC',
            muted: '#6E7C72',
            dark: '#050D07',
          },

          status: {
            success: '#4CAF50',
            warning: '#E2C760',
            danger: '#D32F2F',
            info: '#0288D1',
            live: '#4CAF50',
            pending: '#E2C760',
            finished: '#B8C4BC',
          },
        },

        host: {
          'usa-blue': '#0A3161',
          'usa-red': '#B31942',
          'mex-green': '#006847',
          'mex-red': '#CE1126',
          'can-red': '#D80621',
          'can-ice': '#F5F7FA',
        },
      },

      fontFamily: {
        sans: ['Space Grotesk', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'Trebuchet MS', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        'green-soft': '0 0 18px rgba(76, 175, 80, 0.14)',
        'green-card': '0 0 26px rgba(46, 125, 50, 0.13)',
        'green-hover': '0 0 22px rgba(76, 175, 80, 0.20)',

        'gold-soft': '0 0 18px rgba(212, 175, 55, 0.16)',
        'gold-card': '0 0 26px rgba(212, 175, 55, 0.13)',
        'gold-hover': '0 0 22px rgba(226, 199, 96, 0.20)',

        'premium-card': '0 18px 45px rgba(0, 0, 0, 0.35)',
        'premium-panel': '0 24px 60px rgba(0, 0, 0, 0.45)',
      },

      backgroundImage: {
        'orionix-main':
          'linear-gradient(135deg, #050D07 0%, #08170D 48%, #0E2214 100%)',

        'orionix-card':
          'linear-gradient(145deg, rgba(8,23,13,0.96) 0%, rgba(14,34,20,0.96) 100%)',

        'orionix-panel':
          'linear-gradient(180deg, rgba(8,23,13,0.98) 0%, rgba(5,13,7,0.98) 100%)',

        'orionix-gold':
          'linear-gradient(135deg, #C9A227 0%, #D4AF37 48%, #E2C760 100%)',

        'orionix-green':
          'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #4CAF50 100%)',

        'orionix-button-green':
          'linear-gradient(135deg, #2E7D32 0%, #388E3C 55%, #4CAF50 100%)',

        'orionix-button-gold':
          'linear-gradient(135deg, #C9A227 0%, #D4AF37 50%, #E2C760 100%)',

        'orionix-sidebar-active':
          'linear-gradient(90deg, rgba(46,125,50,0.28) 0%, rgba(76,175,80,0.12) 100%)',

        'orionix-premium-card':
          'linear-gradient(145deg, rgba(8,23,13,0.98) 0%, rgba(14,34,20,0.96) 72%, rgba(212,175,55,0.08) 100%)',
      },

      borderColor: {
        // Compatibilidad con tus clases anteriores
        'green-soft': 'rgba(76, 175, 80, 0.22)',
        'gold-soft': 'rgba(212, 175, 55, 0.25)',

        // Nuevas clases
        'orionix-green-soft': 'rgba(76, 175, 80, 0.22)',
        'orionix-gold-soft': 'rgba(212, 175, 55, 0.25)',
        'orionix-soft': 'rgba(184, 196, 188, 0.12)',
      },

      ringColor: {
        'orionix-green': 'rgba(76, 175, 80, 0.35)',
        'orionix-gold': 'rgba(212, 175, 55, 0.35)',
      },

      spacing: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
  ],
};