/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F6FEB',
        'primary-50': '#eff6ff',
        'primary-100': '#dbeafe',
        'primary-200': '#bfdbfe',
        'primary-300': '#93c5fd',
        'primary-400': '#60a5fa',
        'primary-500': '#1F6FEB',
        'primary-600': '#1d4ed8',
        'primary-700': '#1e40af',
        'primary-800': '#1e3a8a',
        'primary-900': '#1e3a8a',
        'custom-dark': '#111827',
      }
    },
  },
  plugins: [],
}
