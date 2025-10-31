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
import { FileText, RefreshCw, AlertCircle, Download } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import HintTooltip from "./HintTooltip.jsx";
import { getAuditLogs, getAuditStats, getRecentLogins, AuditCategory } from "./auditService.js";
import { getSession } from "./sessionService.js";
import { currency } from "./helpers.js";

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
      const filters = categoryFilter !== "all" ? { category: categoryFilter } : {};
      const [auditLogs, auditStats] = await Promise.all([
        getAuditLogs(filters, limit),
        getAuditStats(),
      ]);
      setLogs(auditLogs);
      setStats(auditStats);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [categoryFilter, limit]);

  // Check if user is admin or manager
  const canViewLogs = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  if (!canViewLogs) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" icon={<AlertCircle />}>
          <Typography variant="h6" fontWeight={600}>Access Denied</Typography>
          <Typography variant="body2">
            You need Admin or Manager privileges to view audit logs.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      [AuditCategory.AUTH]: 'primary',
      [AuditCategory.ORDER]: 'success',
      [AuditCategory.INVENTORY]: 'info',
      [AuditCategory.RECIPE]: 'warning',
      [AuditCategory.USER]: 'error',
      [AuditCategory.PRICING]: 'secondary',
      [AuditCategory.SALES]: 'success',
      [AuditCategory.SYSTEM]: 'default',
    };
    return colors[category] || 'default';
  };

  // Export logs to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Category', 'Action', 'Details'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userEmail,
      log.category,
      log.action,
      JSON.stringify(log.details),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <SectionTitle
        icon={FileText}
        title="Audit Logs"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <HintTooltip title="Refresh audit logs">
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={18} />}
                onClick={loadLogs}
                disabled={loading}
                sx={{ borderRadius: '10px' }}
              >
                Refresh
              </Button>
            </HintTooltip>
            <HintTooltip title="Export logs to CSV file">
              <Button
                variant="contained"
                startIcon={<Download size={18} />}
                onClick={exportToCSV}
                disabled={logs.length === 0}
                sx={{ borderRadius: '10px' }}
              >
                Export
              </Button>
            </HintTooltip>
          </Box>
        }
      />

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Total Logs
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Today
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.today}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Active Users
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.recentUsers.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Categories
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {Object.keys(stats.byCategory).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
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

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Limit</InputLabel>
              <Select
                value={limit}
                label="Limit"
                onChange={(e) => setLimit(e.target.value)}
              >
                <MenuItem value={50}>50 logs</MenuItem>
                <MenuItem value={100}>100 logs</MenuItem>
                <MenuItem value={200}>200 logs</MenuItem>
                <MenuItem value={500}>500 logs</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Activity Log ({logs.length} records)
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="180">Timestamp</TableCell>
                  <TableCell width="200">User</TableCell>
                  <TableCell width="150">Category</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell width="100">Time Ago</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <FileText size={40} color="#ccc" style={{ marginBottom: '12px' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        No audit logs found
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Activity will be logged here
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {log.userEmail}
                        </Typography>
                        {log.userEmail === currentUser?.email && (
                          <Chip label="You" size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.category}
                        size="small"
                        color={getCategoryColor(log.category)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.action}</Typography>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {log.details.itemName || log.details.recipeName || log.details.email || ''}
                          {log.details.total && ` - ${currency(log.details.total)}`}
                          {log.details.quantity && ` (Qty: ${log.details.quantity})`}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {log.timeAgo}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <Card sx={{ borderRadius: '12px' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Activity by Category
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Grid item xs={12} sm={6} md={3} key={category}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                    }}
                  >
                    <Chip
                      label={category}
                      size="small"
                      color={getCategoryColor(category)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h5" fontWeight={700}>
                      {count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {count === 1 ? 'event' : 'events'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AuditLogPage;
