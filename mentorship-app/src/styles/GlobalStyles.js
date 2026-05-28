// src/styles/GlobalStyles.js
import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  /* Reset & base */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-family: ${(props) => props.theme.typography.fontFamilyBody};
    font-size: ${(props) => props.theme.typography.fontSize};
    line-height: ${(props) => props.theme.typography.lineHeight || "1.5"};
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.textPrimary};
    transition: background ${(props) => props.theme.transition},
                color ${(props) => props.theme.transition};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${(props) => props.theme.typography.fontFamilyHeading};
    font-weight: 700;
  }

  body {
    min-height: 100vh;
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.textPrimary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: ${(props) => props.theme.colors.secondary};
    text-decoration: none;
    transition: color ${(props) => props.theme.transition};
    
    &:hover {
      color: ${(props) => props.theme.colors.primary};
    }
  }
`;
