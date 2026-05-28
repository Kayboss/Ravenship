// src/context/ThemeContext.js
import React, { createContext, useState, useMemo } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../styles/themeTokens";

export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState("light");

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(() => (themeName === "light" ? lightTheme : darkTheme), [themeName]);

  return (
    <ThemeContext.Provider value={{ theme: themeName, toggleTheme }}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
