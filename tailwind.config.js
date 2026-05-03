/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e", // Neon Green
        secondary: "#f97316", // Fiery Orange
        background: "#000000", // Pure black
        surface: "#111111", // Dark gray
        textPrimary: "#FFFFFF",
        textSecondary: "#9ca3af" // Muted gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
