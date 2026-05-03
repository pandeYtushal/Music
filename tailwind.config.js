/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10b981", // Emerald Green
        secondary: "#f97316", // Orange 500
        background: "#000000", // True Black
        surface: "#111111", // Very Deep Grey
        textPrimary: "#f8fafc",
        textSecondary: "#94a3b8" // Slate 400
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
