
// NotificationsPage: displays alerts, toggles, and notification history
import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Switch, Table, TableHead, TableRow, TableCell, TableBody, Divider } from "@mui/material";
import { Bell } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import StatusChip from "./StatusChip.jsx";
import { brandRed } from "./helpers.js";
import { listNotifications } from "./analyticsService.js";
import { db } from "./db.js";

/**
 * NotificationsPage
 * - Shows alert toggles, critical/urgent alerts, and notification history
 * - Uses mock data for alert history
 */
const NotificationsPage = () => {
  // State for toggling soon-to-expire and low stock alerts
  const [soon, setSoon] = useState(true);
  const [lowStock, setLowStock] = useState(true);

  // Live notifications from DB
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await listNotifications();
      setHistory(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

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
            <Button variant="outlined" onClick={refresh} disabled={loading}>Refresh</Button>
            <Button variant="text" color="error" onClick={clearAll} disabled={loading}>Clear All</Button>
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
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            Alert Preferences
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  bgcolor: soon ? 'rgba(139, 0, 0, 0.02)' : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Expiry Notifications
                  </Typography>
                  <Switch 
                    checked={soon} 
                    onChange={() => setSoon(v => !v)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: brandRed,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: brandRed,
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Get notified about expiring or expired ingredients
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Status: {soon ? '✓ Active' : '✗ Disabled'}
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
                  bgcolor: lowStock ? 'rgba(139, 0, 0, 0.02)' : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Low Stock Alerts
                  </Typography>
                  <Switch 
                    checked={lowStock} 
                    onChange={() => setLowStock(v => !v)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: brandRed,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: brandRed,
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Get notified when inventory drops below threshold
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Status: {lowStock ? '✓ Active' : '✗ Disabled'}
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
                        {h.ago || 'Recently'}
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
                        {h.ago || 'Recently'}
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
