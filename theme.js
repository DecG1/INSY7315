import { createTheme } from "@mui/material/styles";
import { brandRed } from "./helpers";

const theme = createTheme({
  palette: {
    primary: { main: brandRed },
    secondary: { main: "#d32f2f" },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.12)',
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #0078d7 0%, #005fa3 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #005fa3 0%, #004578 100%)',
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
});

export default theme;
