/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0C',
        surface: '#121214',
        'surface-raised': '#19191C',
        
        primary: '#F4F3EF',
        secondary: '#96969B',
        muted: '#5F6065',
        
        accent: '#00F0FF', // Cyan accent
        'accent-hover': '#00C8D6',
        
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
