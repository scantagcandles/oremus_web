import { createTheme } from "@shopify/restyle";

const palette = {
  primary: "#FFD700", // Gold
  secondary: "#1e2749", // Navy Blue
  success: "#4CAF50",
  error: "#FF5252",
  warning: "#FFC107",
  info: "#2196F3",
  white: "#FFFFFF",
  black: "#000000",
  background: {
    light: "#F5F5F5",
    dark: "#121212",
  },
  text: {
    primary: "#000000",
    secondary: "#666666",
    disabled: "#9E9E9E",
    inverse: "#FFFFFF",
  },
  glass: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.2)",
  },
};

const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

const theme = createTheme({
  colors: palette,
  spacing,
  breakpoints,
  borderRadii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  textVariants: {
    header: {
      fontFamily: "Inter",
      fontWeight: "bold",
      fontSize: 34,
      lineHeight: 42.5,
      color: "text.primary",
    },
    subheader: {
      fontFamily: "Inter",
      fontWeight: "600",
      fontSize: 28,
      lineHeight: 36,
      color: "text.primary",
    },
    body: {
      fontFamily: "Inter",
      fontSize: 16,
      lineHeight: 24,
      color: "text.primary",
    },
    caption: {
      fontFamily: "Inter",
      fontSize: 12,
      lineHeight: 16,
      color: "text.secondary",
    },
  },
});

export type Theme = typeof theme;
export default theme;
