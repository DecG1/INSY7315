
// Header component: displays welcome message and logout button
import React from "react";
import { Box, Typography, Button, alpha, Chip } from "@mui/material";
import { LogOut, Calendar } from "lucide-react";
import { todayStr, brandRed } from "./helpers.js";
import { logLogout } from "./auditService.js";
import { getSession } from "./sessionService.js";
import HintTooltip from "./HintTooltip.jsx";

/**
 * Header for the app
 * @param {string} name - User's name (default: Mario)
 * @param {function} onLogout - Logout handler
 */
const Header = ({ name = "Mario", onLogout }) => {
  const handleLogout = async () => {
    try {
      const session = await getSession();
      if (session?.email) {
        await logLogout(session.email);
      }
    } catch (err) {
      console.error("Error logging logout:", err);
    } finally {
      if (onLogout) {
        onLogout();
      }
    }
  };

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
        px: 4,
        py: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Welcome message and date */}
      <Box>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          sx={{ 
            color: '#0f172a',
            letterSpacing: '-0.5px',
            mb: 0.5,
          }}
        >
          Mario's Italian Restaurant
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calendar size={16} color="#64748b" />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 500,
            }}
          >
            {todayStr}
          </Typography>
        </Box>
      </Box>
      {/* Logout button */}
      <HintTooltip hint="Log out of your account and return to the login screen">
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogOut size={18} />}
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.25,
            borderWidth: 1.5,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderWidth: 1.5,
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
            },
          }}
        >
          Logout
        </Button>
      </HintTooltip>
    </Box>
  );
};

export default Header;
