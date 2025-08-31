import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import logo from '../assets/logo.png';
import { styled } from "@mui/material/styles";
import { BarChart3, Boxes, QrCode, ChefHat, DollarSign, Bell, FileSpreadsheet, Users, Filter } from "lucide-react";

const brandRed = "#8b0000";

const SidebarButton = styled(Button)(({ theme, selected }) => ({
  justifyContent: "flex-start",
  color: selected ? "#fff" : theme.palette.text.primary,
  backgroundColor: selected ? brandRed : "transparent",
  textTransform: "none",
  padding: "10px 12px",
  borderRadius: 12,
  gap: 10,
  "&:hover": { backgroundColor: selected ? brandRed : theme.palette.action.hover },
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
    <Box sx={{ width: 260, height: '100vh', p: 2, display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
        <img src={logo} alt="Logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
        <Typography variant="h6" fontWeight={800} color={brandRed}>logo</Typography>
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
