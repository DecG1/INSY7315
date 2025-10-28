import React from "react";
import { Box, Typography, Divider, Button, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { BarChart3, Boxes, QrCode, ChefHat, DollarSign, Bell, FileSpreadsheet, Users, Filter, UtensilsCrossed } from "lucide-react";
import HintTooltip from "./HintTooltip.jsx"; // Import tooltip for navigation hints

const brandRed = "#8b0000";

// Styled button component for sidebar navigation items
const SidebarButton = styled(Button)(({ theme, selected }) => ({
  justifyContent: "flex-start",
  color: selected ? "#fff" : theme.palette.text.primary,
  backgroundColor: selected ? brandRed : "transparent",
  textTransform: "none",
  padding: "12px 16px",
  borderRadius: 12,
  gap: 12,
  fontWeight: selected ? 600 : 500,
  fontSize: "15px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: selected ? brandRed : "rgba(139, 0, 0, 0.08)",
    transform: "translateX(4px)",
    boxShadow: selected ? "0 4px 12px rgba(139, 0, 0, 0.3)" : "none",
  },
}));

/**
 * Sidebar component
 * Displays navigation menu with icons and labels for all app sections
 * Each menu item includes a hint tooltip when hints are enabled
 * 
 * @param {string} current - Currently active route key
 * @param {function} setCurrent - Function to change active route
 */
const Sidebar = ({ current, setCurrent }) => {
  // Navigation items with labels, icons, and hint text
  const items = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3, hint: "View key metrics, orders today, and weekly financial overview" },
    { key: "inventory", label: "Inventory", icon: Boxes, hint: "Manage stock items, quantities, and expiry dates" },
    { key: "scanner", label: "Docket Scanner", icon: QrCode, hint: "Enter customer orders manually and calculate gratuity" },
    { key: "recipes", label: "Recipes", icon: ChefHat, hint: "Manage recipes and track ingredient usage" },
    { key: "pricing", label: "Ingredient Pricing", icon: DollarSign, hint: "Set and update ingredient costs for accurate pricing" },
    { key: "notifications", label: "Notifications", icon: Bell, hint: "View alerts for low stock and expiring items" },
    { key: "calculator", label: "Calculator", icon: FileSpreadsheet, hint: "Calculate recipe costs based on quantity" },
    { key: "reports", label: "Reports", icon: BarChart3, hint: "View weekly sales analytics and add manual sales entries" },
    { key: "loyalty", label: "Loyalty", icon: Users, hint: "Customer loyalty program (coming soon)" },
    { key: "settings", label: "Settings", icon: Filter, hint: "Configure app preferences, hints, and notifications" },
  ];
  
  // Access theme to adapt sidebar styling for dark mode
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        // Border color adapts to theme mode
        borderRight: 1,
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        // Background uses theme palette for automatic dark/light switching
        bgcolor: theme.palette.background.paper,
        // Shadow strength adjusts for better visibility in dark mode
        boxShadow: theme.palette.mode === 'dark' 
          ? '2px 0 12px rgba(0, 0, 0, 0.5)' 
          : '2px 0 12px rgba(0, 0, 0, 0.04)',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, mt: 1 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            bgcolor: brandRed,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(139, 0, 0, 0.3)',
          }}
        >
          <UtensilsCrossed size={24} color="#ffffff" />
        </Box>
        <Typography variant="h6" fontWeight={800} color={brandRed} sx={{ letterSpacing: '-0.5px' }}>
          Restaurant
        </Typography>
      </Box>
      {/* Render navigation items with hint tooltips */}
      {items.map((it) => (
        <HintTooltip key={it.key} title={it.hint} placement="right">
          <SidebarButton selected={current === it.key ? 1 : 0} onClick={() => setCurrent(it.key)} startIcon={<it.icon size={18} />}>{it.label}</SidebarButton>
        </HintTooltip>
      ))}
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />
      {/* App version and currency info */}
      <Typography variant="caption" color="text.secondary">Ristorante Manager v1.0 • ZAR</Typography>
    </Box>
  );
};

export default Sidebar;
