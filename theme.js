import { createTheme } from "@mui/material/styles";
import { brandRed } from "./helpers";

const theme = createTheme({
  palette: {
    primary: { main: brandRed },
    secondary: { main: "#5c6f7b" },
    background: {
      default: "#f7f8fa",
      paper: "#ffffff",
    },
    divider: "#e6e8eb",
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
          backgroundColor: '#f7f8fa',
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
          backgroundColor: '#ffffff',
          color: '#0f1720',
          boxShadow: 'none',
          borderBottom: '1px solid #e6e8eb',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #e6e8eb',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.1)',
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
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 10 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { paddingTop: 10, paddingBottom: 10 },
        head: { fontWeight: 700 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: 12 },
      },
    },
  },
});

export default theme;
