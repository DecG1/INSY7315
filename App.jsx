
// Main App component: handles authentication and theme
import React, { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./utils/theme";
import AppShell from "./AppShell";
import LoginPage from "./pages/LoginPage";

/**
 * App root component
 * - Shows LoginPage if not authenticated
 * - Shows AppShell (main app) if user is logged in
 * - Applies MUI theme and baseline CSS
 */
export default function App() {
  // User state: null means not logged in
  const [user, setUser] = useState(null);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Show main app or login page based on user state */}
      {user ? <AppShell onLogout={() => setUser(null)} /> : <LoginPage onLogin={setUser} />}
    </ThemeProvider>
  );
}
