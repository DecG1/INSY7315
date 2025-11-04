// SettingsPage: Application settings and preferences
import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Switch, FormControlLabel, Divider, Slider, Alert, Snackbar } from "@mui/material";
import { Settings, Lightbulb, Bell, Globe, Palette, Database } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { useHints } from "./HintsContext.jsx";
import { useThemeMode } from "./ThemeContext.jsx";
import { getSettings, updateSetting, runCleanupTasks } from "./settingsService.js";

/**
 * SettingsPage component
 * Provides user interface for configuring application preferences:
 * - Hints and tutorials toggle
 * - Notification preferences (persisted to IndexedDB)
 * - Data retention policies (auto-cleanup of old logs/notifications)
 * - Display settings (animations, dark mode)
 * - Regional settings (currency, language)
 */
const SettingsPage = () => {
  // Access global hints state from context
  const { hintsEnabled, toggleHints } = useHints();
  // Access global dark mode state from context for theme switching
  const { darkMode, toggleDarkMode } = useThemeMode();

  // Persistent settings state (loaded from IndexedDB)
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [expiryWarnings, setExpiryWarnings] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [auditLogRetention, setAuditLogRetention] = useState(90);
  const [notificationRetention, setNotificationRetention] = useState(30);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load settings from IndexedDB on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setLowStockAlerts(settings.lowStockAlerts ?? true);
      setExpiryWarnings(settings.expiryWarnings ?? true);
      setAnimations(settings.animations ?? true);
      setAuditLogRetention(settings.auditLogRetentionDays ?? 90);
      setNotificationRetention(settings.notificationRetentionDays ?? 30);
    } catch (err) {
      console.error("Failed to load settings:", err);
      showSnackbar('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Toggle handlers that persist to IndexedDB
  const handleLowStockAlertsToggle = async () => {
    const newValue = !lowStockAlerts;
    setLowStockAlerts(newValue);
    try {
      await updateSetting('lowStockAlerts', newValue);
      showSnackbar(`Low stock alerts ${newValue ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error("Failed to update lowStockAlerts:", err);
      setLowStockAlerts(!newValue); // Revert on error
      showSnackbar('Failed to update setting', 'error');
    }
  };

  const handleExpiryWarningsToggle = async () => {
    const newValue = !expiryWarnings;
    setExpiryWarnings(newValue);
    try {
      await updateSetting('expiryWarnings', newValue);
      showSnackbar(`Expiry warnings ${newValue ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error("Failed to update expiryWarnings:", err);
      setExpiryWarnings(!newValue); // Revert on error
      showSnackbar('Failed to update setting', 'error');
    }
  };

  const handleAnimationsToggle = async () => {
    const newValue = !animations;
    setAnimations(newValue);
    try {
      await updateSetting('animations', newValue);
      showSnackbar(`Animations ${newValue ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error("Failed to update animations:", err);
      setAnimations(!newValue); // Revert on error
      showSnackbar('Failed to update setting', 'error');
    }
  };

  const handleAuditLogRetentionChange = async (event, newValue) => {
    setAuditLogRetention(newValue);
    try {
      await updateSetting('auditLogRetentionDays', newValue);
    } catch (err) {
      console.error("Failed to update audit log retention:", err);
      showSnackbar('Failed to update retention setting', 'error');
    }
  };

  const handleNotificationRetentionChange = async (event, newValue) => {
    setNotificationRetention(newValue);
    try {
      await updateSetting('notificationRetentionDays', newValue);
    } catch (err) {
      console.error("Failed to update notification retention:", err);
      showSnackbar('Failed to update retention setting', 'error');
    }
  };

  const handleRunCleanup = async () => {
    try {
      const result = await runCleanupTasks();
      showSnackbar(`Cleaned up ${result.auditLogs} audit logs and ${result.notifications} notifications`);
    } catch (err) {
      console.error("Failed to run cleanup:", err);
      showSnackbar('Failed to run cleanup', 'error');
    }
  };

  // Retention day options
  const retentionMarks = [
    { value: 0, label: 'Never' },
    { value: 7, label: '7' },
    { value: 30, label: '30' },
    { value: 60, label: '60' },
    { value: 90, label: '90' },
    { value: 180, label: '180' },
    { value: 365, label: '1yr' },
  ];

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        animation: animations ? 'fadeIn 0.6s ease-in-out' : 'none',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <SectionTitle icon={Settings} title="Settings" />

      {/* Loading State */}
      {loading && (
        <Alert severity="info">Loading settings...</Alert>
      )}

      {/* Hints & Tutorials Section */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 193, 7, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lightbulb size={24} color="#ffc107" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Hints & Tutorials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Show helpful tooltips and guidance throughout the app
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Hints Toggle Control */}
          <FormControlLabel
            control={
              <Switch
                checked={hintsEnabled}
                onChange={toggleHints}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Enable Hints
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  When enabled, hover over buttons for 1 second to see helpful tooltips explaining their function
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0 }}
          />

          {/* Status Indicator - Enabled */}
          {hintsEnabled && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: '12px',
                bgcolor: 'rgba(76, 175, 80, 0.08)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
              }}
            >
              <Typography variant="body2" color="success.main" fontWeight={600}>
                ✓ Hints are enabled
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Hover over any button for 1 second to see what it does. Try it on the navigation menu or action buttons!
              </Typography>
            </Box>
          )}

          {/* Status Indicator - Disabled */}
          {!hintsEnabled && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: '12px',
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Hints are disabled
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Toggle on to show helpful tooltips throughout the application
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Notifications Settings Section */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(139, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={24} color="#8b0000" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage alert preferences
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Low Stock Alerts Toggle */}
          <FormControlLabel
            control={
              <Switch 
                checked={lowStockAlerts}
                onChange={handleLowStockAlertsToggle}
                disabled={loading}
                color="primary" 
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Low Stock Alerts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Get notified when inventory items are running low
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0, mb: 2 }}
          />

          {/* Expiry Warnings Toggle */}
          <FormControlLabel
            control={
              <Switch 
                checked={expiryWarnings}
                onChange={handleExpiryWarningsToggle}
                disabled={loading}
                color="primary" 
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Expiry Warnings
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Alert when items are approaching expiration date
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0 }}
          />
        </CardContent>
      </Card>

      {/* Display Settings Section */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(33, 150, 243, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={24} color="#2196f3" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Display
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customize appearance
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Dark Mode Toggle - Switches between light and dark theme */}
          <FormControlLabel
            control={
              <Switch 
                checked={darkMode}
                onChange={toggleDarkMode}
                color="primary" 
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Dark Mode
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Use dark theme for reduced eye strain
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0, mb: 2 }}
          />

          {/* Animations Toggle */}
          <FormControlLabel
            control={
              <Switch 
                checked={animations}
                onChange={handleAnimationsToggle}
                disabled={loading}
                color="primary" 
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Animations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enable smooth transitions and animations
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0 }}
          />
        </CardContent>
      </Card>

      {/* Regional Settings Section */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe size={24} color="#4caf50" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Regional
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Language and currency preferences
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Regional Information Display (Read-only) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Currency Setting */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Currency
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ZAR (South African Rand)
              </Typography>
            </Box>
            {/* Language Setting */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Language
              </Typography>
              <Typography variant="body2" color="text.secondary">
                English
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Data Retention Settings Section */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(156, 39, 176, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={24} color="#9c27b0" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Data Retention
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automatically delete old records to manage storage
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Audit Log Retention Slider */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              Audit Log Retention
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Automatically delete audit logs older than this many days (0 = never delete)
            </Typography>
            <Slider
              value={auditLogRetention}
              onChange={handleAuditLogRetentionChange}
              disabled={loading}
              min={0}
              max={365}
              marks={retentionMarks}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value === 0 ? 'Never' : `${value} days`}
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" color="primary" fontWeight={600} sx={{ mt: 1 }}>
              Current: {auditLogRetention === 0 ? 'Never delete' : `${auditLogRetention} days`}
            </Typography>
          </Box>

          {/* Notification Retention Slider */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              Notification Retention
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Automatically delete notifications older than this many days (0 = never delete)
            </Typography>
            <Slider
              value={notificationRetention}
              onChange={handleNotificationRetentionChange}
              disabled={loading}
              min={0}
              max={365}
              marks={retentionMarks}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value === 0 ? 'Never' : `${value} days`}
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" color="primary" fontWeight={600} sx={{ mt: 1 }}>
              Current: {notificationRetention === 0 ? 'Never delete' : `${notificationRetention} days`}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Manual Cleanup Button */}
          <Box
            onClick={handleRunCleanup}
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: 'rgba(156, 39, 176, 0.08)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(156, 39, 176, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography variant="body2" color="primary" fontWeight={600}>
              Run Cleanup Now
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Manually trigger cleanup based on current retention settings. This will delete old audit logs and notifications.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
