/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/renderer/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6467f2',
        'background-light': '#f6f6f8',
        'background-dark': '#101122',
        'surface-dark': '#1a1b3a',
        'accent-dark': '#232448',
        surface: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
          950: '#161a1d',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        'soft-dark': '0 2px 12px rgba(0,0,0,0.3)',
        'primary/5': '0 0 0 1px rgba(100, 103, 242, 0.05), 0 20px 25px -5px rgba(100, 103, 242, 0.1)',
      },
    },
  },
  plugins: [],
}
