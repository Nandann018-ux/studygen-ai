
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary-default) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)'
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface-default) / <alpha-value>)',
          bg: 'rgb(var(--color-surface-bg) / <alpha-value>)',
          sidebar: 'rgb(var(--color-surface-sidebar) / <alpha-value>)',
          hover: 'rgb(var(--color-surface-hover) / <alpha-value>)',
          border: 'rgb(var(--color-surface-border) / <alpha-value>)'
        },
        text: {
          main: 'rgb(var(--color-text-main) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          dark: 'rgb(var(--color-text-dark) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
