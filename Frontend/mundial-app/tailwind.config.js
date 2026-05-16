/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta base de fútbol
        'football': {
          'dark': '#1a1a2e', // Negro profundo
          'grass': '#1e7e34', // Verde de cancha (primario)
          'grass-light': '#2ecc71', // Verde claro
          'grass-dark': '#0d5a2a', // Verde oscuro
          'gold': '#f39c12', // Dorado vibrante
          'white': '#ffffff',
          'accent-red': '#e74c3c', // Rojo vibrante
          'accent-blue': '#3498db', // Azul vibrante
          'accent-yellow': '#f1c40f', // Amarillo energético
          'accent-purple': '#9b59b6', // Púrpura
          'gray-dark': '#2c3e50',
          'gray-light': '#ecf0f1',
        },
        // Sedes 2026: Estados Unidos, México y Canadá
        'host': {
          'usa-blue': '#0A3161',
          'usa-red': '#B31942',
          'mex-green': '#006847',
          'mex-red': '#CE1126',
          'can-red': '#D80621',
          'can-ice': '#F5F7FA',
        },
        // Tonos de apoyo para una UI energética y elegante
        'stadium': {
          'night': '#0D1B2A',
          'steel': '#1B263B',
          'light': '#E0E6ED',
          'crowd': '#415A77',
        },
        'festival': {
          'sunset': '#FF7A00',
          'teal': '#00A896',
          'amber': '#FFC857',
        },
      },
      gradients: {
        'football': 'linear-gradient(135deg, #1e7e34 0%, #2ecc71 100%)',
        'football-dark': 'linear-gradient(135deg, #1a1a2e 0%, #0d5a2a 100%)',
      },
      spacing: {
        'safe-top': 'max(1rem, constant(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, constant(safe-area-inset-bottom))',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
