/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'team-blue': '#00f3ff',
        'team-pink': '#ff00aa',
        'team-purple': '#bd00ff',
        'dark-bg': '#050505',
        'card-bg': '#101015',
      },
    },
  },
  plugins: [],
}