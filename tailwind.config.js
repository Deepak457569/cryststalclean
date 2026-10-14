/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        porcelain: '#F8FAFA',
        white: '#FFFFFF',
        ink: '#1C262B',
        slate: '#5E6D73',
        mist: '#E3EAEC',
        teal: {
          DEFAULT: '#2E6F73',
          hover: '#24595C',
          focus: '#1D4649',
          light: '#EAF2F2',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        '3xl': '4px',
        full: '4px', // single 4px radius rule
      },
      maxWidth: {
        content: '1200px',
      },
      spacing: {
        'section-desktop': '96px',
        'section-mobile': '56px',
      },
    },
  },
  plugins: [],
}
