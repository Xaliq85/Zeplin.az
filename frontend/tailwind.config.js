/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0b1c38',
          light: '#0f2448',
        },
        blue: {
          zep: '#1648a0',
          mid: '#2563d4',
          light: '#5a9cd8',
        },
        gold: {
          DEFAULT: '#f5c518',
          dark: '#c9a200',
          light: '#ffe066',
        },
      },
      fontFamily: {
        chakra: ['Chakra Petch', 'sans-serif'],
        barlow: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
