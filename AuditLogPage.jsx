// AuditLogPage: View and filter audit logs (Admin/Manager only)
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Grid,
} from "@mui/material";
import { FileText, RefreshCw, Download, History } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import HintTooltip from "./HintTooltip.jsx";
import { getAuditLogs, getAuditStats, AuditCategory } from "./auditService.js";
import { getSession } from "./sessionService.js";

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [limit, setLimit] = useState(50);

  // Load current user
  useEffect(() => {
    (async () => {
      const session = await getSession();
      setCurrentUser(session);
    })();
  }, []);

  // Load audit logs
  const loadLogs = async () => {
    setLoading(true);
    try {
      const [auditLogs, auditStats] = await Promise.all([
        getAuditLogs(limit),
        getAuditStats(),
      ]);

      // Filter by category if selected
      const filtered = categoryFilter === "all" 
        ? auditLogs 
        : auditLogs.filter(log => log.category === categoryFilter);

      setLogs(filtered);
      setStats(auditStats);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [limit, categoryFilter]);

  // Export logs to CSV
  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Category", "Action", "Details"];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userEmail,
      log.category,
      log.action,
      log.details || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Check if user has access
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="error">
          Access denied. Only administrators and managers can view audit logs.
        </Alert>
      </Box>
    );
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case AuditCategory.AUTH: return 'primary';
      case AuditCategory.ORDER: return 'success';
      case AuditCategory.INVENTORY: return 'info';
      case AuditCategory.RECIPE: return 'secondary';
      case AuditCategory.USER: return 'error';
      case AuditCategory.PRICING: return 'warning';
      case AuditCategory.SALES: return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <SectionTitle
        icon={History}
        title="Audit Logs"
        hint="View all system activity and user actions with timestamps, categories, and detailed information"
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <HintTooltip hint="Download all audit logs as a CSV file for archival or reporting purposes">
              <Button
                variant="outlined"
                startIcon={<Download size={18} />}
                onClick={exportToCSV}
                disabled={logs.length === 0}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Export CSV
              </Button>
            </HintTooltip>
            <HintTooltip hint="Reload audit logs to see the latest system activity">
              <Button
                variant="contained"
                startIcon={<RefreshCw size={18} />}
                onClick={loadLogs}
                disabled={loading}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Refresh
              </Button>
            </HintTooltip>
          </Box>
        }
      />

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Total Logs
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Last 24 Hours
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                  {stats.recent24h}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Categories
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                  {Object.keys(stats.byCategory).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Active Users
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                  {Object.keys(stats.byUser).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ borderRadius: '16px' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <HintTooltip hint="Filter audit logs by category (AUTH, ORDER, INVENTORY, USER, etc.)">
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {Object.values(AuditCategory).map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </HintTooltip>
            </Grid>
            <Grid item xs={12} md={6}>
              <HintTooltip hint="Limit the number of audit log entries displayed (most recent first)">
                <FormControl fullWidth>
                  <InputLabel>Limit</InputLabel>
                  <Select
                    value={limit}
                    label="Limit"
                    onChange={(e) => setLimit(e.target.value)}
                  >
                    <MenuItem value={25}>Last 25</MenuItem>
                    <MenuItem value={50}>Last 50</MenuItem>
                    <MenuItem value={100}>Last 100</MenuItem>
                    <MenuItem value={500}>Last 500</MenuItem>
                  </Select>
                </FormControl>
              </HintTooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card sx={{ borderRadius: '16px' }}>
        <CardContent sx={{ p: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No audit logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {log.userEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.category} 
                        color={getCategoryColor(log.category)} 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          maxWidth: 300, 
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {log.details || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogPage;
