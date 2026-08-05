import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CourseProvider } from "./context/CourseContext.jsx";
import { ToastProvider } from "./lib/notify.jsx";
import { GlobalStyles } from "./styles/GlobalStyles.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <CourseProvider>
        <ToastProvider>
          <GlobalStyles />
          <App />
        </ToastProvider>
      </CourseProvider>
    </ThemeProvider>
  </React.StrictMode>
);
