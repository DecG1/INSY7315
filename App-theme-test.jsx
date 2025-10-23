import React from "react";
import { ThemeProvider, CssBaseline, Box, Typography, Card, CardContent, Button } from "@mui/material";
import theme from "./theme.js";

export default function App() {
  console.log("App with theme rendering...");
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8ebef 100%)",
          p: 3,
        }}
      >
        <Card sx={{ width: 400 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Theme Test
            </Typography>
            <Typography variant="body1" gutterBottom>
              If you see this styled card, the theme is working!
            </Typography>
            <Button variant="contained" fullWidth sx={{ mt: 2 }}>
              Test Button
            </Button>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
