/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brass: { DEFAULT: '#b5813f', light: '#c99a5c' },
      },
    },
  },
  plugins: [],
};
