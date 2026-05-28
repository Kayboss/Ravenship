// src/styles/themeTokens.js
export const lightTheme = {
  colors: {
    primary: "#b50064", // Vibrant Magenta
    primaryContainer: "#dc207e",
    secondary: "#006590", // Support Blue
    accent: "#ffd200", // Gamification Yellow
    background: "#fbf9f8",
    surface: "#ffffff",
    surfaceDim: "#dcd9d9",
    textPrimary: "#1b1c1c", // Deep charcoal
    textSecondary: "#594048",
    success: "#27AE60",
    outline: "#e0e0e0",
  },
  spacing: {
    xs: "8px",
    sm: "16px",
    md: "24px",
    lg: "40px",
    xl: "48px",
  },
  typography: {
    fontFamilyHeading: "'Plus Jakarta Sans', sans-serif",
    fontFamilyBody: "'Work Sans', sans-serif",
    fontSize: "16px",
    lineHeight: "1.5",
    heading1: "3rem", // 48px
    heading2: "2rem", // 32px
    heading3: "1.5rem", // 24px
  },
  borderRadius: "8px",
  transition: "0.3s ease-in-out",
  breakpoints: {
    mobile: "480px",
    tablet: "768px",
    laptop: "1024px",
    desktop: "1280px",
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: "#121212",
    surface: "#1e1e1e",
    textPrimary: "#fbf9f8",
    textSecondary: "#dcd9d9",
    outline: "#333333",
  },
};

export const breakpoints = {
  mobile: "480px",
  tablet: "768px",
  laptop: "1024px",
  desktop: "1280px",
};
