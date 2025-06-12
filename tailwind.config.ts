import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // OREMUS Colors
        primary: {
          DEFAULT: "#1a237e",
          foreground: "#ffffff",
          50: '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#3f51b5',
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#1a237e',
        },
        secondary: {
          DEFAULT: "#FFD700",
          foreground: "#1a237e",
          50: '#fffef7',
          100: '#fffce8',
          200: '#fff9c4',
          300: '#fff59d',
          400: '#fff176',
          500: '#ffeb3b',
          600: '#fdd835',
          700: '#fbc02d',
          800: '#f9a825',
          900: '#f57f17',
        },
        // Glass colors
        glass: {
          primary: "rgba(26, 35, 126, 0.15)",
          secondary: "rgba(255, 215, 0, 0.25)",
          white: "rgba(255, 255, 255, 0.1)",
          black: "rgba(0, 0, 0, 0.3)",
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(45deg, #FFD700, #F4E4BC, #A78B52)',
        'gradient-blue': 'linear-gradient(135deg, #1a237e, #303f9f, #1a237e)',
        'gradient-dark': 'linear-gradient(180deg, #000000, #1a1a1a, #000000)',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "flame": "flame 1.5s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)" },
          "100%": { boxShadow: "0 0 30px rgba(255, 215, 0, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        flame: {
          "0%, 100%": { transform: "scaleY(1) scaleX(1)" },
          "50%": { transform: "scaleY(1.1) scaleX(0.95)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}

export default config