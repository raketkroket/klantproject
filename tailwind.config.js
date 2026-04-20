/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        roc: {
          50:  '#fff5f0',
          100: '#ffe8da',
          200: '#ffc9a8',
          300: '#ffa070',
          400: '#ff6e38',
          500: '#e84a10',
          600: '#cc3f0d',
          700: '#a8330a',
          800: '#872809',
          900: '#6e2009',
        },
      },
    },
  },
  plugins: [],
};
