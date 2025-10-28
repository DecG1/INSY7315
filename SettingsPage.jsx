// SettingsPage: Application settings and preferences
import React from "react";
import { Box, Card, CardContent, Typography, Switch, FormControlLabel, Divider } from "@mui/material";
import { Settings, Lightbulb, Bell, Globe, Palette } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { useHints } from "./HintsContext.jsx";
import { useThemeMode } from "./ThemeContext.jsx";

/**
 * SettingsPage component
 * Provides user interface for configuring application preferences:
 * - Hints and tutorials toggle
 * - Notification preferences
 * - Display settings (animations, dark mode)
 * - Regional settings (currency, language)
 */
const SettingsPage = () => {
  // Access global hints state from context
  const { hintsEnabled, toggleHints } = useHints();
  // Access global dark mode state from context for theme switching
  const { darkMode, toggleDarkMode } = useThemeMode();

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        animation: 'fadeIn 0.6s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <SectionTitle icon={Settings} title="Settings" />

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
            control={<Switch defaultChecked color="primary" />}
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
            control={<Switch defaultChecked color="primary" />}
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
            control={<Switch defaultChecked color="primary" />}
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
    </Box>
  );
};

export default SettingsPage;
