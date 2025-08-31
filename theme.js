import { createTheme } from "@mui/material/styles";
import { brandRed } from "./helpers";

const theme = createTheme({
  palette: {
    primary: { main: brandRed },
    secondary: { main: "#d32f2f" },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial"].join(", ")
  },
  shape: { borderRadius: 16 },
});

export default theme;
