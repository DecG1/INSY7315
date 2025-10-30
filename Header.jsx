
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
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
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
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1,
          borderWidth: 2,
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Header;
