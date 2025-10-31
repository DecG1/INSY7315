
// AppShell: Main layout and navigation for authenticated users
import React, { useState } from "react";
import { Box, Card, CardContent, Typography, useTheme, Container } from "@mui/material";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import Dashboard from "./Dashboard.jsx";
import InventoryPage from "./InventoryPage.jsx";
import ScannerPage from "./ScannerPage.jsx";
import RecipesPage from "./RecipesPage.jsx";
import PricingPage from "./PricingPage.jsx";
import NotificationsPage from "./NotificationsPage.jsx";
import CalculatorPage from "./CalculatorPage.jsx";
import ReportsPage from "./ReportsPage.jsx";
import SettingsPage from "./SettingsPage.jsx";
import MenuBuilderPage from "./MenuBuilderPage.jsx";
import UserManagementPage from "./UserManagementPage.jsx";
import AuditLogPage from "./AuditLogPage.jsx";

/**
 * AppShell component
 * - Handles sidebar navigation and page routing
 * - Displays header and current page content
 * - Shows a "Coming Soon" message for unknown routes
 */
const AppShell = ({ onLogout }) => {
  // Current route state (string key)
  const [route, setRoute] = useState("dashboard");
  // Access theme to detect dark mode and style accordingly
  const theme = useTheme();

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: theme.palette.background.default,
    }}>
      {/* Sidebar navigation */}
      <Sidebar current={route} setCurrent={setRoute} />
      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header with logout */}
        <Header onLogout={onLogout} />
        {/* Page content, routed by route key */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
          {route === "dashboard" && <Dashboard onNavigate={setRoute} />}
          {route === "inventory" && <InventoryPage />}
          {route === "scanner" && <ScannerPage />}
          {route === "recipes" && <RecipesPage />}
          {route === "pricing" && <PricingPage />}
          {route === "menubuilder" && <MenuBuilderPage />}
          {route === "notifications" && <NotificationsPage />}
          {route === "calculator" && <CalculatorPage />}
          {route === "reports" && <ReportsPage />}
          {route === "settings" && <SettingsPage />}
          {route === "users" && <UserManagementPage />}
          {route === "auditlogs" && <AuditLogPage />}
          {/* Fallback for unknown routes */}
            {route !== "dashboard" && route !== "inventory" && route !== "scanner" && route !== "recipes" && route !== "pricing" && route !== "menubuilder" && route !== "notifications" && route !== "calculator" && route !== "reports" && route !== "settings" && route !== "users" && route !== "auditlogs" && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6">Coming Soon</Typography>
                  <Typography variant="body2" color="text.secondary">This section is under development.</Typography>
                </CardContent>
              </Card>
            </Box>
          )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
