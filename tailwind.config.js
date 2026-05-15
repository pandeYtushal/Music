/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#ffffff', dark: '#e5e5e5' },
        secondary: { DEFAULT: '#000000', light: '#1a1a1a' },
        surface:   { DEFAULT: '#111111', raised: '#1a1a1a', high: '#242424' },
        border:    { subtle: 'rgba(255,255,255,0.06)', mid: 'rgba(255,255,255,0.10)', strong: 'rgba(255,255,255,0.18)' },
        muted:     '#5e5e5e',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-up':   'fadeUp 0.45s ease both',
        'scale-in':  'scaleIn 0.3s ease both',
        'shimmer':   'shimmer 1.6s infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity:'0', transform:'translateY(16px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        scaleIn: { from: { opacity:'0', transform:'scale(0.96)' },      to: { opacity:'1', transform:'scale(1)' } },
        shimmer: { '0%':{ backgroundPosition:'-400% 0' }, '100%':{ backgroundPosition:'400% 0' } },
      },
      boxShadow: {
        'glass':  '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':   '0 4px 24px rgba(0,0,0,0.4)',
        'lift':   '0 20px 60px rgba(0,0,0,0.6)',
        'white':  '0 0 30px rgba(255,255,255,0.08)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        'dark-gradient':  'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)',
        'hero-fade':      'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.7) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
