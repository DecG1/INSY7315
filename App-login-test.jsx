import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme.js";
import LoginPage from "./LoginPage.jsx";

export default function App() {
  console.log("App with LoginPage rendering...");
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoginPage />
    </ThemeProvider>
  );
}
