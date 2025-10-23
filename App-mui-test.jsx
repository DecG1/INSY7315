import React from "react";
import { ThemeProvider, CssBaseline, Box, Typography, createTheme } from "@mui/material";

const simpleTheme = createTheme();

export default function App() {
  console.log("Test App rendering...");
  
  return (
    <ThemeProvider theme={simpleTheme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Material-UI Test</Typography>
        <Typography variant="body1">If you see this, Material-UI is working!</Typography>
      </Box>
    </ThemeProvider>
  );
}
