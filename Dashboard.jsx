import React, { useEffect, useState, useMemo } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, ToggleButtonGroup, ToggleButton, List, ListItem, ListItemText, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import {
  BarChart3, AlertTriangle, CalendarClock, PackageX, DollarSign, RefreshCw, Bell, ExternalLink, TrendingUp, TrendingDown, Trophy, AlertCircle
} from "lucide-react";

import MetricCard from "./MetricCard.jsx";
import SectionTitle from "./SectionTitle.jsx";
import StatusChip from "./StatusChip.jsx";
import { currency } from "./helpers.js";
import HintTooltip from "./HintTooltip.jsx";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { countInventory, countRecipes, weeklySales, monthlySales, yearlySales, countOrdersToday, countExpiringSoon, listNotifications, getOrderHistory } from "./analyticsService.js";
import { liveQuery } from "dexie";
import { db } from "./db.js";

export default function Dashboard({ onNavigate }) {
  const [invCount, setInvCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0); // number of items expiring within threshold
  const [ordersToday, setOrdersToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [chartData, setChartData] = useState([]);                 // chart data from DB
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState('weekly'); // Current period: 'weekly', 'monthly', or 'yearly'
  const [notifications, setNotifications] = useState([]); // Recent notifications
  const [orders, setOrders] = useState([]); // Order history for sales analysis
  
  /**
   * Fetch sales data based on selected period
   * Routes to appropriate analytics function (weeklySales, monthlySales, or yearlySales)
   * @param {string} selectedPeriod - The period to fetch data for
   * @returns {Promise<Array>} Sales data for the selected period
   */
  const fetchSalesData = async (selectedPeriod) => {
    switch(selectedPeriod) {
      case 'monthly':
        return await monthlySales();
      case 'yearly':
        return await yearlySales();
      case 'weekly':
      default:
        return await weeklySales();
    }
  };
  
  /**
   * Fetch all dashboard data including metrics and chart data
   * Called on mount and when period changes or user clicks refresh
   */
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [ic, rc, salesData, ot, es, notifs, orderHistory] = await Promise.all([
        countInventory(),
        countRecipes(),
        fetchSalesData(period), // Fetch sales for current period
        countOrdersToday(),
        countExpiringSoon(7), // items expiring within next 7 days
        listNotifications(), // Fetch recent notifications
        getOrderHistory(), // Fetch order history for analytics
      ]);
      setInvCount(ic);
      setRecipeCount(rc);

      setChartData(salesData);
      setOrdersToday(ot);
      setExpiringSoon(es);
      setNotifications(notifs.slice(0, 5)); // Keep only 5 most recent
      setOrders(orderHistory || []); // Store order history
      
      // Calculate today's revenue based on period context
      // For weekly: find today's day of week (Sun-Sat)
      // For monthly: find today's day of month (1-31)
      // For yearly: find current month's total
      if (period === 'weekly') {
        const todayBucket = salesData.find(
          (d) => d.day === ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()]
        );
        setRevenueToday(todayBucket ? todayBucket.sales : 0);
      } else if (period === 'monthly') {
        const today = new Date().getDate();
        const todayBucket = salesData.find(d => d.day === String(today));
        setRevenueToday(todayBucket ? todayBucket.sales : 0);
      } else {
        // For yearly, show today's revenue from current month
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = monthNames[new Date().getMonth()];
        const todayBucket = salesData.find(d => d.day === currentMonth);
        setRevenueToday(todayBucket ? todayBucket.sales : 0);
      }

  // no-op; expiringSoon already set
    } finally {
      setIsRefreshing(false);
    }
  };

  // Re-fetch data when component mounts or when period changes
  useEffect(() => {
    fetchData();
  }, [period]); // Re-fetch when period changes

  /**
   * Analyze sales data to calculate item performance
   * Aggregates all items from orders to identify best and worst sellers
   */
  const salesAnalysis = useMemo(() => {
    const itemMap = new Map();
    let totalQuantity = 0;

    orders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;

      order.items.forEach(item => {
        const itemName = item.name || item.item || "Unknown Item";
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const itemRevenue = quantity * price;

        totalQuantity += quantity;

        if (itemMap.has(itemName)) {
          const existing = itemMap.get(itemName);
          existing.quantity += quantity;
          existing.revenue += itemRevenue;
        } else {
          itemMap.set(itemName, {
            name: itemName,
            quantity: quantity,
            revenue: itemRevenue,
          });
        }
      });
    });

    const itemStats = Array.from(itemMap.values()).map(item => ({
      ...item,
      quantityPercent: totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0,
    }));

    itemStats.sort((a, b) => b.quantity - a.quantity);

    return {
      itemStats,
      bestSellers: itemStats.slice(0, 5),
      worstSellers: itemStats.slice(-5).reverse(),
    };
  }, [orders]);

  // Live update Expiring Soon whenever inventory changes
  useEffect(() => {
    const sub = liveQuery(() => db.inventory.toArray()).subscribe({
      next: async () => {
        try {
          const es = await countExpiringSoon(7);
          setExpiringSoon(es);
        } catch (e) {
          // swallow
        }
      },
    });
    return () => sub.unsubscribe();
  }, []);
  
  /**
   * Handle period toggle button change
   * Updates the period state which triggers data re-fetch via useEffect
   * @param {Event} event - Click event
   * @param {string} newPeriod - New period selection ('weekly', 'monthly', or 'yearly')
   */
  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Metric cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <MetricCard title="Low Stock Items" value={invCount} note="Total inventory items" icon={AlertTriangle} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard title="Orders Today" value={ordersToday} note="From today's saved dockets" icon={CalendarClock} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard title="Expiring Soon" value={expiringSoon} note="Next 7 days" icon={PackageX} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard title="Daily Revenue" value={currency(revenueToday)} note="From local sales table" icon={DollarSign} />
        </Grid>
      </Grid>

      {/* Financial overview chart with period selector */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionTitle 
            icon={BarChart3} 
            title="Financial Overview"
            action={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Period selector toggle buttons */}
                <HintTooltip title="Switch between weekly, monthly, or yearly revenue view">
                  <ToggleButtonGroup
                    value={period}
                    exclusive
                    onChange={handlePeriodChange}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        py: 0.75,
                        fontSize: '0.875rem',
                        border: '1.5px solid #e2e8f0',
                        transition: 'all 0.2s ease-in-out',
                        '&.Mui-selected': {
                          backgroundColor: '#8b0000',
                          color: '#fff',
                          borderColor: '#8b0000',
                          '&:hover': {
                            backgroundColor: '#6f0000',
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="weekly">Weekly</ToggleButton>
                    <ToggleButton value="monthly">Monthly</ToggleButton>
                    <ToggleButton value="yearly">Yearly</ToggleButton>
                  </ToggleButtonGroup>
                </HintTooltip>
                
                {/* Refresh button */}
                <HintTooltip title="Refresh all dashboard metrics and charts to show the latest data from saved dockets and sales">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<RefreshCw size={16} />} 
                    onClick={fetchData}
                    disabled={isRefreshing}
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
                  >
                    {isRefreshing ? 'Refreshing…' : 'Refresh'}
                  </Button>
                </HintTooltip>
              </Box>
            }
          />
          {chartData.length > 0 ? (
            <Box sx={{ height: 256 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(v) => currency(v)} />
                  <Line type="monotone" dataKey="sales" name="Sales" stroke="#8b0000" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="costs" name="Costs" stroke="#ffcdd2" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No sales data yet. Add sales entries to populate the chart.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Sales Analytics: Best & Worst Sellers */}
      {salesAnalysis.itemStats.length > 0 && (
        <Grid container spacing={3}>
          {/* Best Sellers */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Trophy size={20} color="#4caf50" />
                  <Typography variant="h6" fontWeight={700}>
                    Top Sellers
                  </Typography>
                  <Chip label={`Top ${salesAnalysis.bestSellers.length}`} color="success" size="small" />
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesAnalysis.bestSellers.map((item, idx) => (
                      <TableRow key={idx} sx={{ backgroundColor: idx === 0 ? 'rgba(76, 175, 80, 0.05)' : 'transparent' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={idx + 1} 
                              size="small" 
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                backgroundColor: idx === 0 ? 'success.main' : 'grey.300',
                                color: idx === 0 ? 'white' : 'text.primary',
                                fontWeight: 'bold'
                              }} 
                            />
                            <Typography variant="body2" fontWeight={idx === 0 ? 700 : 400}>
                              {item.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main">
                            {currency(item.revenue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Typography variant="body2">{item.quantityPercent.toFixed(1)}%</Typography>
                            <TrendingUp size={14} color="#4caf50" />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {/* Worst Sellers */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AlertCircle size={20} color="#ff9800" />
                  <Typography variant="h6" fontWeight={700}>
                    Slow Movers
                  </Typography>
                  <Chip label={`Bottom ${salesAnalysis.worstSellers.length}`} color="warning" size="small" />
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesAnalysis.worstSellers.map((item, idx) => (
                      <TableRow key={idx} sx={{ backgroundColor: idx === 0 ? 'rgba(255, 152, 0, 0.05)' : 'transparent' }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={idx === 0 ? 700 : 400}>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="warning.main">
                            {currency(item.revenue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Typography variant="body2">{item.quantityPercent.toFixed(1)}%</Typography>
                            <TrendingDown size={14} color="#ff9800" />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Notifications Panel */}
      <Card
        sx={{
          borderRadius: '12px',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <SectionTitle 
            icon={Bell} 
            title="Recent Notifications"
            action={
              <HintTooltip title="View all notifications and manage alert preferences">
                <Button 
                  variant="text" 
                  size="small"
                  endIcon={<ExternalLink size={14} />}
                  onClick={() => onNavigate?.('notifications')}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
                >
                  View All
                </Button>
              </HintTooltip>
            }
          />
          {notifications.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: '10px',
                bgcolor: 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <Bell size={40} color="#ccc" style={{ marginBottom: '12px' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                No notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All clear! You'll see alerts here when actions are needed.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notif, index) => (
                <React.Fragment key={notif.id}>
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: '10px',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <StatusChip 
                            label={notif.tone === 'error' ? 'Alert' : 'Info'} 
                            color={notif.tone === 'error' ? 'error' : 'default'}
                          />
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {notif.ago || 'Recently'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {notif.msg}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Box sx={{ height: 1, bgcolor: 'divider', mx: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
