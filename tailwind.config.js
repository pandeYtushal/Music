/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6", // Vibrant Violet
        secondary: "#3b82f6", // Electric Blue
        background: "#030014", // Deep space black
        surface: "#0f0a29", // Dark violet tint
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
