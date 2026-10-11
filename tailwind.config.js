/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF9F6',
          100: '#F5F4EE',
          200: '#EBE9DF',
          300: '#DDD9CB',
        },
        charcoal: {
          800: '#22252A',
          900: '#141619',
          950: '#0C0D0E',
        },
        champagne: {
          100: '#F7F3EB',
          300: '#E2D5BE',
          500: '#C5A880',
          600: '#AF8F63',
          700: '#907147',
        },
        sage: {
          100: '#EEF2EC',
          300: '#C2D1BE',
          600: '#526E54',
          800: '#344535',
        },
        whatsapp: {
          500: '#25D366',
          600: '#20BA5A',
          700: '#128C7E',
          800: '#075E54',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'luxury-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 6px 12px -3px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
