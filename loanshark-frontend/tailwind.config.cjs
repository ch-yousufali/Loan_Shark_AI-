/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        safe: '#10B981',
        caution: '#F59E0B',
        'high-risk': '#F97316',
        predatory: '#EF4444',
      }
    },
  },
  plugins: [],
}