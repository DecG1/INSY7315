import React, { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline, Box, Typography } from "@mui/material";
import theme from "./theme.js";
import LoginPage from "./LoginPage.jsx";
import AppShell from "./AppShell.jsx";
import { getSession, clearSession } from "./sessionService.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false); // Start with false to skip loading
  const [error, setError] = useState(null);

  console.log("App component rendering, loading:", loading, "session:", session);

  useEffect(() => {
    console.log("useEffect running - checking session...");
    (async () => {
      try {
        const s = await getSession();
        console.log("Session retrieved:", s);
        setSession(s);
      } catch (err) {
        console.error("Error getting session:", err);
        // Don't show error, just continue without session
        setSession(null);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await clearSession();
      setSession(null);
    } catch (err) {
      console.error("Error clearing session:", err);
      setSession(null);
    }
  };

  const handleLoginSuccess = () => {
    console.log("Login successful, reloading session...");
    // Re-fetch session after login
    (async () => {
      try {
        const s = await getSession();
        console.log("Session after login:", s);
        setSession(s);
      } catch (err) {
        console.error("Error getting session after login:", err);
      }
    })();
  };

  // Always render the app - if there's an issue it will show in console
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!session ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AppShell onLogout={handleLogout} />
      )}
    </ThemeProvider>
  );
}
