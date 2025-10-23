
// Header component: displays welcome message and logout button
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { LogOut } from "lucide-react";
import { todayStr, brandRed } from "./helpers.js";

/**
 * Header for the app
 * @param {string} name - User's name (default: Mario)
 * @param {function} onLogout - Logout handler
 */
const Header = ({ name = "Mario", onLogout }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2.5,
        borderBottom: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        bgcolor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Welcome message and date */}
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
          Mario's Italian Restaurant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {todayStr}
        </Typography>
      </Box>
      {/* Logout button */}
      <Button
        variant="outlined"
        color="error"
        startIcon={<LogOut size={16} />}
        onClick={onLogout}
        sx={{
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Header;
