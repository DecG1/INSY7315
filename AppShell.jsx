
// AppShell: Main layout and navigation for authenticated users
import React, { useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import ScannerPage from "./pages/ScannerPage";
import RecipesPage from "./pages/RecipesPage";
import PricingPage from "./pages/PricingPage";
import NotificationsPage from "./pages/NotificationsPage";
import CalculatorPage from "./pages/CalculatorPage";
import ReportsPage from "./pages/ReportsPage";

/**
 * AppShell component
 * - Handles sidebar navigation and page routing
 * - Displays header and current page content
 * - Shows a "Coming Soon" message for unknown routes
 */
const AppShell = ({ onLogout }) => {
  // Current route state (string key)
  const [route, setRoute] = useState("dashboard");

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Sidebar navigation */}
      <Sidebar current={route} setCurrent={setRoute} />
      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header with logout */}
        <Header onLogout={onLogout} />
        {/* Page content, routed by route key */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, overflow: 'auto' }}>
          {route === "dashboard" && <Dashboard />}
          {route === "inventory" && <InventoryPage />}
          {route === "scanner" && <ScannerPage />}
          {route === "recipes" && <RecipesPage />}
          {route === "pricing" && <PricingPage />}
          {route === "notifications" && <NotificationsPage />}
          {route === "calculator" && <CalculatorPage />}
          {route === "reports" && <ReportsPage />}
          {/* Fallback for unknown routes */}
          {route !== "dashboard" && route !== "inventory" && route !== "scanner" && route !== "recipes" && route !== "pricing" && route !== "notifications" && route !== "calculator" && route !== "reports" && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6">Coming Soon</Typography>
                  <Typography variant="body2" color="text.secondary">This section is under development.</Typography>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
