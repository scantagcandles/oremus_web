// web/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
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
        },
        secondary: {
          DEFAULT: "#FFD700",
          foreground: "#1a237e",
        },
        // Glass colors
        glass: {
          primary: "rgba(26, 35, 126, 0.15)",
          secondary: "rgba(255, 215, 0, 0.25)",
          white: "rgba(255, 255, 255, 0.1)",
          black: "rgba(0, 0, 0, 0.3)",
        },
        // Status colors
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
        // Feature colors
        prayer: "#FFD700",
        mass: "#9C27B0",
        academy: "#4CAF50",
        library: "#FF5722",
        player: "#3F51B5",
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
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flame": "flame 1.5s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)" },
          "100%": { boxShadow: "0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)" },
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
