/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-bg': '#0b1120',
        'dashboard-card': 'rgba(30, 41, 59, 0.6)',
        'accent-blue': '#3b82f6',
        'accent-purple': '#8b5cf6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        'vibrant': '20px',
      }
    },
  },
  plugins: [],
}
