// ThemeContext: Global state for dark/light mode theme management
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { brandRed } from "./helpers.js";

// Create context for theme mode management
const ThemeContext = createContext();

/**
 * Custom hook to access theme context
 * @returns {object} - { darkMode, toggleDarkMode, setDarkMode }
 * @throws {Error} - If used outside ThemeProvider
 */
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return context;
};

/**
 * ThemeProvider component
 * Provides global theme mode (light/dark) to all child components
 * Persists theme preference to localStorage
 * @param {React.ReactNode} children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Load dark mode preference from localStorage (default: light mode)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved !== null ? JSON.parse(saved) : false; // default: light mode
  });

  // Persist to localStorage whenever dark mode setting changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Toggle function for convenience
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Create dynamic MUI theme based on dark mode setting
  // Theme automatically updates when darkMode changes
  const theme = useMemo(() => createTheme({
    // Set palette mode (MUI will adjust many colors automatically)
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: brandRed },
      secondary: { main: "#d32f2f" },
      // Custom background colors for dark/light modes
      background: darkMode ? {
        default: "#121212", // Main app background in dark mode
        paper: "#1e1e1e",   // Card/paper background in dark mode
      } : {
        default: "#f5f7fa", // Main app background in light mode
        paper: "#ffffff",   // Card/paper background in light mode
      },
    },
    typography: {
      fontFamily: ['"Segoe UI"', 'Inter', 'system-ui', '-apple-system', 'Roboto', 'Arial', 'sans-serif'].join(", "),
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.5px',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.3px',
      },
      h6: {
        fontWeight: 600,
      },
      body1: {
        letterSpacing: '0.3px',
      },
    },
    shape: { borderRadius: 16 },
    components: {
      // Card component styling with dark mode support
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            // Enhanced shadows for dark mode for better depth perception
            boxShadow: darkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.5)'
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: darkMode
                ? '0 6px 25px rgba(0, 0, 0, 0.7)'
                : '0 6px 25px rgba(0, 0, 0, 0.12)',
            },
            animation: 'fadeIn 0.6s ease-in-out',
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          },
        },
      },
      // Button component styling with dark mode gradients
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: darkMode
                ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            // Different gradient colors for dark vs light mode
            background: darkMode
              ? 'linear-gradient(135deg, #8b0000 0%, #660000 100%)' // Dark mode: darker red gradient
              : 'linear-gradient(135deg, #0078d7 0%, #005fa3 100%)', // Light mode: blue gradient
            '&:hover': {
              background: darkMode
                ? 'linear-gradient(135deg, #660000 0%, #440000 100%)'
                : 'linear-gradient(135deg, #005fa3 0%, #004578 100%)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
    },
  }), [darkMode]); // Recreate theme when darkMode changes

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {/* Apply the dynamic theme to all child components */}
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
