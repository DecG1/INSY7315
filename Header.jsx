
// Header component: displays welcome message and logout button
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { LogOut } from "lucide-react";
import { todayStr, brandRed } from "../utils/helpers";

/**
 * Header for the app
 * @param {string} name - User's name (default: Mario)
 * @param {function} onLogout - Logout handler
 */
const Header = ({ name = "Mario", onLogout }) => {
  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      {/* Welcome message and date */}
      <Box>
        <Typography variant="h6" fontWeight={800}>Welcome, {name}!</Typography>
        <Typography variant="body2" color="text.secondary">{todayStr}</Typography>
      </Box>
      {/* Logout button */}
      <Button variant="outlined" color="error" startIcon={<LogOut size={16} />} onClick={onLogout}>Logout</Button>
    </Box>
  );
};

export default Header;
