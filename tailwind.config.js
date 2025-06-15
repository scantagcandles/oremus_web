/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a237e',
        secondary: '#ffd700',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
        info: '#0ea5e9',
        // Custom colors for different sections
        mass: '#8b5cf6',
        prayer: '#ec4899',
        candle: '#f59e0b',
        shop: '#10b981',
        community: '#6366f1',
        academy: '#8b5cf6',
        player: '#14b8a6',
        library: '#f97316',
        // Glass UI colors
        'glass-black': 'rgba(17, 25, 40, 0.75)',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-secondary': 'rgba(255, 215, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(88, 28, 135))',
      },
    },
  },
  plugins: [],
}
