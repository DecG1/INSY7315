// NotificationsPage: displays alerts, toggles, and notification history
import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Switch, Table, TableHead, TableRow, TableCell, TableBody, Divider } from "@mui/material";
import { Bell, Settings as SettingsIcon } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import StatusChip from "./StatusChip.jsx";
import { brandRed } from "./helpers.js";
import { listNotifications } from "./analyticsService.js";
import { db } from "./db.js";
import HintTooltip from "./HintTooltip.jsx";
import { getSettings } from "./settingsService.js";

/**
 * NotificationsPage
 * - Shows notification preferences (read-only, links to Settings)
 * - Displays critical/urgent alerts and notification history
 * - Provides refresh and clear all functionality
 */
const NotificationsPage = () => {
  // Live notifications from DB
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Settings (read-only display)
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [expiryWarnings, setExpiryWarnings] = useState(true);
  
  /**
   * Calculate relative time from timestamp
   * @param {number} timestamp - Unix timestamp in milliseconds
   * @returns {string} Relative time string (e.g., "just now", "5m ago", "2h ago", "3d ago")
   */
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'recently';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than 1 minute
    if (diff < 60000) return 'just now';
    
    // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    // Less than 24 hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    // Days
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    // Months
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    // Years
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  };

  async function refresh() {
    setLoading(true);
    try {
      const rows = await listNotifications();
      setHistory(rows);
    } finally {
      setLoading(false);
    }
  }
  
  async function loadSettings() {
    try {
      const settings = await getSettings();
      setLowStockAlerts(settings.lowStockAlerts ?? true);
      setExpiryWarnings(settings.expiryWarnings ?? true);
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }

  useEffect(() => { 
    refresh();
    loadSettings();
    
    // Update relative times every minute to keep them current
    const intervalId = setInterval(() => {
      setHistory(prev => [...prev]); // Trigger re-render to update relative times
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);

  async function clearAll() {
    await db.notifications.clear();
    await refresh();
  }

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
      {/* Page title */}
      <SectionTitle
        icon={Bell}
        title="Notifications & Alerts"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <HintTooltip title="Reload all notifications from the database to see the latest alerts">
              <Button variant="outlined" onClick={refresh} disabled={loading}>Refresh</Button>
            </HintTooltip>
            <HintTooltip title="Delete all notifications from history. This cannot be undone.">
              <Button variant="text" color="error" onClick={clearAll} disabled={loading}>Clear All</Button>
            </HintTooltip>
          </Box>
        }
      />

      {/* Alert Settings */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Alert Preferences
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<SettingsIcon size={16} />}
              onClick={() => window.location.hash = '#/settings'}
              sx={{ textTransform: 'none' }}
            >
              Manage in Settings
            </Button>
          </Box>
          
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: 'rgba(33, 150, 243, 0.05)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              mb: 3,
            }}
          >
            <Typography variant="body2" color="primary" fontWeight={600} sx={{ mb: 1 }}>
              ℹ️ Current Notification Settings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              These settings are managed in the Settings page. Changes made there will affect which notifications you receive.
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  bgcolor: expiryWarnings ? 'rgba(139, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Expiry Notifications
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: '6px',
                      bgcolor: expiryWarnings ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      color: expiryWarnings ? 'success.main' : 'text.secondary',
                      fontWeight: 700,
                    }}
                  >
                    {expiryWarnings ? 'ENABLED' : 'DISABLED'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Get notified about expiring or expired ingredients
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Status: {expiryWarnings ? '✓ Active' : '✗ Disabled'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  bgcolor: lowStockAlerts ? 'rgba(139, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Low Stock Alerts
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: '6px',
                      bgcolor: lowStockAlerts ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      color: lowStockAlerts ? 'success.main' : 'text.secondary',
                      fontWeight: 700,
                    }}
                  >
                    {lowStockAlerts ? 'ENABLED' : 'DISABLED'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Get notified when inventory drops below threshold
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Status: {lowStockAlerts ? '✓ Active' : '✗ Disabled'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Alerts Summary */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Recent Alerts
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {history.length} total notification{history.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={2}>
            {history.length === 0 && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: '12px',
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Bell size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={600}>
                    No notifications yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    All clear! You'll see alerts here when actions are needed.
                  </Typography>
                </Box>
              </Grid>
            )}
            {history.slice(0, 4).map((h) => {
              const isError = h.tone === 'error';
              return (
                <Grid item xs={12} md={6} key={h.id}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: isError ? 'rgba(211, 47, 47, 0.2)' : 'rgba(0, 0, 0, 0.08)',
                      bgcolor: isError ? 'rgba(211, 47, 47, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: isError ? 'rgba(211, 47, 47, 0.4)' : 'rgba(0, 0, 0, 0.15)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <StatusChip 
                        label={isError ? 'Error' : 'Info'} 
                        color={isError ? 'error' : 'default'}
                      />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {h.timestamp ? getRelativeTime(h.timestamp) : (h.ago || 'Recently')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                      {h.msg}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {h.id}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          {history.length > 4 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing 4 of {history.length} notifications. See full history below.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Notification History Table (live data) */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Complete History
            </Typography>
            {history.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {history.length} record{history.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    '& .MuiTableCell-head': {
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'text.primary',
                      borderBottom: '2px solid',
                      borderColor: 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <TableCell width="80">ID</TableCell>
                  <TableCell width="120">Type</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell width="140">Time</TableCell>
                  <TableCell align="right" width="120">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center' }}>
                      <Bell size={40} color="#ccc" style={{ marginBottom: '12px' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        No notification history available
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        New notifications will appear here
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {history.map((h, index) => (
                  <TableRow 
                    key={h.id} 
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                      },
                      bgcolor: index % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.01)',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        #{h.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '6px',
                          bgcolor: h.tone === 'error' ? 'rgba(211, 47, 47, 0.08)' : 'rgba(33, 150, 243, 0.08)',
                          color: h.tone === 'error' ? '#d32f2f' : '#1976d2',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {h.tone || 'info'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {h.msg}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {h.timestamp ? getRelativeTime(h.timestamp) : (h.ago || 'Recently')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <StatusChip 
                        label={h.tone === 'error' ? 'Action Required' : 'Acknowledged'} 
                        color={h.tone === 'error' ? 'error' : 'success'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationsPage;
