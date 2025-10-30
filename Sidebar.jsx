import React from "react";
import { Box, Typography, Divider, Button, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { BarChart3, Boxes, QrCode, ChefHat, DollarSign, Bell, FileSpreadsheet, Users, Filter, UtensilsCrossed, TrendingUp } from "lucide-react";
import HintTooltip from "./HintTooltip.jsx"; // Import tooltip for navigation hints
import Logo from "./Logo.jsx"; // Import custom restaurant logo

const brandRed = "#8b0000";

// Styled button component for sidebar navigation items
const SidebarButton = styled(Button)(({ theme, selected }) => ({
  justifyContent: "flex-start",
  color: selected ? "#fff" : theme.palette.text.primary,
  backgroundColor: selected ? brandRed : "transparent",
  textTransform: "none",
  padding: "10px 14px",
  borderRadius: 10,
  gap: 12,
  fontWeight: selected ? 600 : 500,
  fontSize: "15px",
  transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
  borderLeft: selected ? `3px solid #6f0000` : `3px solid transparent`,
  "&:hover": {
    backgroundColor: selected ? brandRed : "rgba(139, 0, 0, 0.06)",
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
  { key: "scanner", label: "Order Scanner", icon: QrCode, hint: "Enter customer orders manually and calculate gratuity" },
    { key: "recipes", label: "Recipes", icon: ChefHat, hint: "Manage recipes and track ingredient usage" },
    { key: "pricing", label: "Ingredient Pricing", icon: DollarSign, hint: "Set and update ingredient costs for accurate pricing" },
    { key: "menubuilder", label: "Menu Builder", icon: UtensilsCrossed, hint: "Smart menu suggestions based on available inventory" },
    { key: "salesanalytics", label: "Sales Analytics", icon: TrendingUp, hint: "Analyze best-selling and least-selling items to optimize your menu" },
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
        width: 264,
        height: '100vh',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: theme.palette.background.paper,
        boxShadow: 'none',
        gap: 2,
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, mt: 1 }}>
        {/* Centered restaurant logo */}
        <Logo size={48} />
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
