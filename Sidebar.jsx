import React, { useEffect, useState } from "react";
import { Box, Typography, Divider, Button, useTheme, alpha } from "@mui/material";
import { styled } from "@mui/material/styles";
import { BarChart3, Boxes, QrCode, ChefHat, DollarSign, Bell, FileSpreadsheet, Users, Filter, UtensilsCrossed, TrendingUp, UserCog, History } from "lucide-react";
import HintTooltip from "./HintTooltip.jsx"; // Import tooltip for navigation hints
import Logo from "./Logo.jsx"; // Import custom restaurant logo
import { getSession } from "./sessionService.js";

const brandRed = "#8b0000";

// Styled button component for sidebar navigation items
const SidebarButton = styled(Button)(({ theme, selected }) => ({
  justifyContent: "flex-start",
  color: selected ? "#fff" : theme.palette.text.primary,
  backgroundColor: selected ? brandRed : "transparent",
  textTransform: "none",
  padding: "11px 16px",
  borderRadius: 12,
  gap: 14,
  fontWeight: selected ? 600 : 500,
  fontSize: "0.9375rem",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `2px solid ${selected ? brandRed : 'transparent'}`,
  marginBottom: '4px',
  position: 'relative',
  overflow: 'hidden',
  "&::before": {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '3px',
    height: '100%',
    backgroundColor: selected ? '#fff' : 'transparent',
    transition: 'all 0.2s ease-in-out',
  },
  "&:hover": {
    backgroundColor: selected ? brandRed : alpha(brandRed, 0.08),
    transform: 'translateX(4px)',
    boxShadow: selected ? '0 4px 12px rgba(139, 0, 0, 0.2)' : 'none',
  },
  "& .MuiButton-startIcon": {
    marginRight: '10px',
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
  const [role, setRole] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const session = await getSession();
      if (mounted) setRole(session?.role ?? null);
    })();
    return () => { mounted = false; };
  }, []);

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
    { key: "auditlogs", label: "Audit Logs", icon: History, hint: "Review who did what and when (Admin/Manager)", guard: (r) => r === 'admin' || r === 'manager' },
    { key: "users", label: "User Management", icon: UserCog, hint: "Manage user accounts, roles, and passwords (Admin only)", guard: (r) => r === 'admin' },
    { key: "loyalty", label: "Loyalty", icon: Users, hint: "Customer loyalty program (coming soon)" },
    { key: "settings", label: "Settings", icon: Filter, hint: "Configure app preferences, hints, and notifications" },
  ];

  // Apply role-based filtering; default to hiding guarded items until role is known
  const filtered = items.filter(it => !it.guard || it.guard(role));
  
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
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: theme.palette.background.paper,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        gap: 1.5,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        mb: 3, 
        mt: 1,
        pb: 3,
        borderBottom: '2px solid',
        borderColor: 'divider',
      }}>
        {/* Centered restaurant logo */}
        <Logo size={52} />
      </Box>
      {/* Render navigation items with hint tooltips */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {filtered.map((it) => (
          <HintTooltip key={it.key} title={it.hint} placement="right">
            <SidebarButton 
              selected={current === it.key ? 1 : 0} 
              onClick={() => setCurrent(it.key)} 
              startIcon={<it.icon size={20} strokeWidth={current === it.key ? 2.5 : 2} />}
            >
              {it.label}
            </SidebarButton>
          </HintTooltip>
        ))}
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />
      {/* App version and currency info */}
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        borderRadius: 2, 
        bgcolor: alpha(brandRed, 0.05),
        border: '1px solid',
        borderColor: alpha(brandRed, 0.1),
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontWeight: 600,
            display: 'block',
            textAlign: 'center',
          }}
        >
          Ristorante Manager v1.0
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 700,
            display: 'block',
            textAlign: 'center',
            color: brandRed,
            mt: 0.5,
          }}
        >
          ZAR
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
