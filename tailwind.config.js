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
        secondary: "#059669", // Darker Green
        background: "#0f172a", // Slate 900
        surface: "#1e293b", // Slate 800
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
