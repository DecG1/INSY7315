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
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: brandRed },
      secondary: { main: '#5c6f7b' },
      background: darkMode
        ? { default: '#121212', paper: '#1e1e1e' }
        : { default: '#f7f8fa', paper: '#ffffff' },
      divider: darkMode ? 'rgba(255,255,255,0.12)' : '#e6e8eb',
    },
    typography: {
      fontFamily: ['"Segoe UI"', 'Inter', 'system-ui', '-apple-system', 'Roboto', 'Arial', 'sans-serif'].join(", "),
      h4: { fontWeight: 700, letterSpacing: '-0.4px' },
      h5: { fontWeight: 700, letterSpacing: '-0.3px' },
      h6: { fontWeight: 600, letterSpacing: '-0.2px' },
      subtitle1: { color: '#5c6f7b' },
      body1: { letterSpacing: '0.2px' },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: darkMode ? '#121212' : '#f7f8fa',
            scrollbarColor: '#c1c7cd transparent',
            scrollbarWidth: 'thin',
          },
          '::-webkit-scrollbar': { width: 8, height: 8 },
          '::-webkit-scrollbar-thumb': { backgroundColor: '#c1c7cd', borderRadius: 8 },
          '::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            color: darkMode ? '#e5e7eb' : '#0f1720',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.12)' : '#e6e8eb',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.12)' : '#e6e8eb',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode
              ? '0 1px 2px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.6)'
              : '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 16px',
            boxShadow: 'none',
          },
          containedPrimary: {
            backgroundColor: brandRed,
            '&:hover': { backgroundColor: '#6f0000' },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': { borderWidth: 2 },
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { paddingTop: 10, paddingBottom: 10 },
          head: { fontWeight: 700 },
        },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { fontSize: 12 } },
      },
    },
  }), [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {/* Apply the dynamic theme to all child components */}
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
