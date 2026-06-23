/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontWeight: {
        400: '400',
        500: '500',
        700: '700',
      },
      colors: {
        lime: '#A8E63D',
        indigo: '#1E1B4B',
        violet: '#7C3AED',
        'violet-lt': '#A78BFA',
        coral: '#FF4D4D',
        amber: '#F59E0B',
        surface: '#F4F4F6',
        muted: '#6B7280',
      },
      borderRadius: {
        card: '16px',
        btn: '50px',
        inp: '12px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
}
