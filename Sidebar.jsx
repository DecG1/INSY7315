import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { BarChart3, Boxes, QrCode, ChefHat, DollarSign, Bell, FileSpreadsheet, Users, Filter, UtensilsCrossed } from "lucide-react";

const brandRed = "#8b0000";

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

const Sidebar = ({ current, setCurrent }) => {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "inventory", label: "Inventory", icon: Boxes },
    { key: "scanner", label: "Docket Scanner", icon: QrCode },
    { key: "recipes", label: "Recipes", icon: ChefHat },
    { key: "pricing", label: "Ingredient Pricing", icon: DollarSign },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "calculator", label: "Calculator", icon: FileSpreadsheet },
    { key: "reports", label: "Reports", icon: BarChart3 },
    { key: "loyalty", label: "Loyalty", icon: Users },
    { key: "settings", label: "Settings", icon: Filter },
  ];
  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        bgcolor: '#ffffff',
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.04)',
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
      {items.map((it) => (
        <SidebarButton key={it.key} selected={current === it.key ? 1 : 0} onClick={() => setCurrent(it.key)} startIcon={<it.icon size={18} />}>{it.label}</SidebarButton>
      ))}
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">Ristorante Manager v1.0 • ZAR</Typography>
    </Box>
  );
};

export default Sidebar;
