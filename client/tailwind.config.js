/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#513ed9',
          light: '#7261e0',
          dark: '#3d2ea5'
        },
        surface: {
          DEFAULT: '#ffffff',
          bg: '#f4f5f8',
          accent: '#faebf2' // pinkish AI insight bg
        },
        text: {
          main: '#1a1d2d',
          muted: '#808298'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
