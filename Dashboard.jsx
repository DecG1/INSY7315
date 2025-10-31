import React, { useEffect, useState, useMemo } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, ToggleButtonGroup, ToggleButton, List, ListItem, ListItemText, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Chip, FormControl, InputLabel, Select, MenuItem, Slider, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from "@mui/material";
import {
  BarChart3, AlertTriangle, CalendarClock, PackageX, DollarSign, RefreshCw, Bell, ExternalLink, TrendingUp, TrendingDown, Trophy, AlertCircle, PieChart
} from "lucide-react";

import MetricCard from "./MetricCard.jsx";
import SectionTitle from "./SectionTitle.jsx";
import StatusChip from "./StatusChip.jsx";
import { currency } from "./helpers.js";
import HintTooltip from "./HintTooltip.jsx";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from "recharts";
import { countInventory, countRecipes, weeklySales, monthlySales, yearlySales, countOrdersToday, countExpiringSoon, listNotifications, getOrderHistory } from "./analyticsService.js";
import { liveQuery } from "dexie";
import { db } from "./db.js";
import { quickSeed } from "./seedData.js";

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
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showExpiringDialog, setShowExpiringDialog] = useState(false);
  const [showRevenueDialog, setShowRevenueDialog] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState('daily');
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Analytics filters
  const [timePeriodFilter, setTimePeriodFilter] = useState('all'); // all, 7days, 30days, 90days
  const [sortBy, setSortBy] = useState('quantity'); // quantity, revenue, frequency
  const [minQuantity, setMinQuantity] = useState(0); // Minimum quantity threshold
  
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
      const [ic, rc, salesData, ot, es, notifs, orderHistory, invList] = await Promise.all([
        countInventory(),
        countRecipes(),
        fetchSalesData(period), // Fetch sales for current period
        countOrdersToday(),
        countExpiringSoon(7), // items expiring within next 7 days
        listNotifications(), // Fetch recent notifications
        getOrderHistory(), // Fetch order history for analytics
        db.inventory?.toArray?.() ?? [], // Fetch full inventory list
      ]);
      setInvCount(ic);
      setRecipeCount(rc);

      setChartData(salesData);
      setOrdersToday(ot);
      setExpiringSoon(es);
      setNotifications(notifs.slice(0, 5)); // Keep only 5 most recent
      setOrders(orderHistory || []); // Store order history
  setInventoryList(invList || []);
      
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
   * Filter orders based on time period
   */
  const filteredOrders = useMemo(() => {
    if (timePeriodFilter === 'all') return orders;

    const now = new Date();
    const cutoffDate = new Date();
    
    if (timePeriodFilter === '7days') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timePeriodFilter === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timePeriodFilter === '90days') {
      cutoffDate.setDate(now.getDate() - 90);
    }

    return orders.filter(order => {
      const orderDate = new Date(order.timestamp || order.date);
      return orderDate >= cutoffDate;
    });
  }, [orders, timePeriodFilter]);

  /**
   * Analyze sales data to calculate item performance
   * Aggregates all items from orders to identify best and worst sellers
   * Includes frequency tracking (how many different orders contain the item)
   */
  const salesAnalysis = useMemo(() => {
    const itemMap = new Map();
    let totalQuantity = 0;
    let totalRevenue = 0;

    filteredOrders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;

      order.items.forEach(item => {
  const itemName = item.name || item.item || "Unknown Item";
  // Default to 1 if quantity is missing/zero to support scanner entries without qty
  const parsedQty = Number(item.quantity);
  const quantity = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1;
        const price = Number(item.price) || 0;
        const itemRevenue = quantity * price;

        totalQuantity += quantity;
        totalRevenue += itemRevenue;

        if (itemMap.has(itemName)) {
          const existing = itemMap.get(itemName);
          existing.quantity += quantity;
          existing.revenue += itemRevenue;
          existing.frequency += 1; // Count how many times item appears in orders
        } else {
          itemMap.set(itemName, {
            name: itemName,
            quantity: quantity,
            revenue: itemRevenue,
            frequency: 1, // First occurrence
          });
        }
      });
    });

    // Filter by minimum quantity
    let itemStats = Array.from(itemMap.values())
      .filter(item => item.quantity >= minQuantity)
      .map(item => ({
        ...item,
        quantityPercent: totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0,
        revenuePercent: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
        avgQuantityPerOrder: item.quantity / item.frequency,
      }));

    // Sort based on selected criteria
    if (sortBy === 'revenue') {
      itemStats.sort((a, b) => b.revenue - a.revenue);
    } else if (sortBy === 'frequency') {
      itemStats.sort((a, b) => b.frequency - a.frequency);
    } else {
      itemStats.sort((a, b) => b.quantity - a.quantity);
    }

    return {
      itemStats,
      bestSellers: itemStats.slice(0, 5),
      worstSellers: itemStats.slice(-5).reverse(),
      totalQuantity,
      totalRevenue,
    };
  }, [filteredOrders, minQuantity, sortBy]);

  /**
   * Prepare data for pie chart visualization
   * Top 5 items get individual slices, rest grouped as "Other"
   */
  const pieChartData = useMemo(() => {
    if (salesAnalysis.itemStats.length === 0) return [];

    const topItems = salesAnalysis.itemStats.slice(0, 5);
    const otherItems = salesAnalysis.itemStats.slice(5);
    
    const otherTotal = otherItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const data = topItems.map(item => ({
      name: item.name,
      value: item.quantity,
      percent: item.quantityPercent,
    }));

    if (otherTotal > 0) {
      data.push({
        name: 'Other Items',
        value: otherTotal,
        percent: salesAnalysis.totalQuantity > 0 ? (otherTotal / salesAnalysis.totalQuantity) * 100 : 0,
      });
    }

    return data;
  }, [salesAnalysis]);

  // Colors for pie chart
  const PIE_COLORS = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#607d8b'];

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

  /**
   * Handle seeding the database with sample data
   */
  const handleSeedData = async () => {
    if (confirm('This will clear all existing data and populate the database with sample meals, ingredients, and orders. Continue?')) {
      setIsSeeding(true);
      try {
        await quickSeed();
      } catch (error) {
        console.error('Error seeding database:', error);
        alert('Failed to seed database. Check console for details.');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  return (
    <Box
      sx={{
        animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Grid container spacing={3}>
        {/* Seed Data Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -1 }}>
            <Button
              variant="outlined"
              onClick={handleSeedData}
              disabled={isSeeding}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                px: 3,
                py: 1,
                borderColor: 'rgba(139, 0, 0, 0.3)',
                color: '#8b0000',
                '&:hover': {
                  borderColor: '#8b0000',
                  backgroundColor: 'rgba(139, 0, 0, 0.05)',
                },
              }}
            >
              {isSeeding ? 'Seeding Database...' : '🌱 Seed Sample Data'}
            </Button>
          </Box>
        </Grid>
        
        {/* Metric cards */}
        <Grid item xs={12} md={3}>
          <MetricCard 
            title="Low Stock Items" 
            value={invCount} 
            note="Total inventory items" 
            icon={AlertTriangle}
            onClick={() => setShowInventoryDialog(true)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard 
            title="Orders Today" 
            value={ordersToday} 
            note="From today's saved dockets" 
            icon={CalendarClock}
            onClick={() => setShowOrdersDialog(true)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard 
            title="Expiring Soon" 
            value={expiringSoon} 
            note="Next 7 days" 
            icon={PackageX}
            onClick={() => setShowExpiringDialog(true)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard 
            title="Daily Revenue" 
            value={currency(revenueToday)} 
            note="From local sales table" 
            icon={DollarSign}
            onClick={() => { setRevenuePeriod('daily'); setShowRevenueDialog(true); }}
          />
        </Grid>

      {/* Dialogs */}
      <Dialog 
        open={showOrdersDialog} 
        onClose={() => setShowOrdersDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, fontWeight: 700 }}>Today's Orders</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {(() => {
            const todayStr = new Date().toDateString();
            const todaysOrders = orders.filter(o => new Date(o.date || o.timestamp).toDateString() === todayStr);
            if (todaysOrders.length === 0) {
              return (
                <Typography color="text.secondary">No orders saved today.</Typography>
              );
            }
            return (
              <List>
                {todaysOrders.map((o, idx) => (
                  <ListItem key={idx} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{new Date(o.date || o.timestamp).toLocaleString()}</Typography>
                      <Typography variant="subtitle2" color="success.main">{currency(o.amount || 0)}</Typography>
                    </Box>
                    {Array.isArray(o.items) && o.items.length > 0 ? (
                      <Table size="small" sx={{ backgroundColor: 'rgba(0,0,0,0.015)', borderRadius: 1 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {o.items.map((it, i) => {
                            const q = Number(it.quantity) > 0 ? Number(it.quantity) : 1;
                            const p = Number(it.price) || 0;
                            return (
                              <TableRow key={i}>
                                <TableCell>{it.name || 'Item'}</TableCell>
                                <TableCell align="right">{q}</TableCell>
                                <TableCell align="right">{currency(p)}</TableCell>
                                <TableCell align="right">{currency(q * p)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No item details available for this order.</Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setShowOrdersDialog(false)} 
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revenue Details Dialog */}
      <Dialog 
        open={showRevenueDialog} 
        onClose={() => setShowRevenueDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, fontWeight: 700 }}>Revenue Details</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              color="primary"
              size="small"
              value={revenuePeriod}
              exclusive
              onChange={(e, v) => v && setRevenuePeriod(v)}
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  '&.Mui-selected': {
                    backgroundColor: '#8b0000',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#6f0000',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="daily">Daily</ToggleButton>
              <ToggleButton value="weekly">Weekly</ToggleButton>
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="yearly">Yearly</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {(() => {
            const today = new Date();
            const ordersList = orders || [];

            if (revenuePeriod === 'daily') {
              const todayStr = today.toDateString();
              const todays = ordersList.filter(o => new Date(o.date || o.timestamp).toDateString() === todayStr);
              const total = todays.reduce((s, o) => s + (Number(o.amount) || 0), 0);
              return (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Total: {currency(total)}</Typography>
                  {todays.length === 0 ? (
                    <Typography color="text.secondary">No sales recorded today.</Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {todays.map((o, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{new Date(o.date || o.timestamp).toLocaleTimeString()}</TableCell>
                            <TableCell align="right">{currency(Number(o.amount) || 0)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              );
            }

            // Helper to init buckets
            const range = [];
            if (revenuePeriod === 'weekly') {
              const start = new Date(today);
              start.setDate(today.getDate() - 6);
              start.setHours(0,0,0,0);
              for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                range.push({ key: d.toDateString(), label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], sales: 0 });
              }
            } else if (revenuePeriod === 'monthly') {
              const start = new Date(today.getFullYear(), today.getMonth(), 1);
              const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
              for (let i = 1; i <= daysInMonth; i++) {
                range.push({ key: new Date(today.getFullYear(), today.getMonth(), i).toDateString(), label: String(i), sales: 0 });
              }
            } else if (revenuePeriod === 'yearly') {
              const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
              for (let i = 0; i < 12; i++) {
                range.push({ key: i, label: monthNames[i], sales: 0 });
              }
            }

            // Aggregate
            ordersList.forEach(o => {
              const d = new Date(o.date || o.timestamp);
              if (revenuePeriod === 'weekly') {
                const key = new Date(d.toDateString()).toDateString();
                const bucket = range.find(b => b.key === key);
                if (bucket) bucket.sales += Number(o.amount) || 0;
              } else if (revenuePeriod === 'monthly') {
                const key = new Date(d.toDateString()).toDateString();
                const bucket = range.find(b => b.key === key);
                if (bucket) bucket.sales += Number(o.amount) || 0;
              } else if (revenuePeriod === 'yearly') {
                const idx = d.getMonth();
                const bucket = range.find(b => b.key === idx);
                if (bucket) bucket.sales += Number(o.amount) || 0;
              }
            });

            const total = range.reduce((s, b) => s + b.sales, 0);
            return (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Total: {currency(total)}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{revenuePeriod === 'yearly' ? 'Month' : revenuePeriod === 'monthly' ? 'Day' : 'Day'}</TableCell>
                      <TableCell align="right">Sales</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {range.map((b, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{b.label}</TableCell>
                        <TableCell align="right">{currency(b.sales)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setShowRevenueDialog(false)} 
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Dialog */}
      <Dialog 
        open={showInventoryDialog} 
        onClose={() => setShowInventoryDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, fontWeight: 700 }}>Inventory Items</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {inventoryList.length === 0 ? (
            <Typography color="text.secondary">No inventory items found.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit</TableCell>
                  <TableCell align="right">Expiry</TableCell>
                  <TableCell align="right">Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryList.map((row) => (
                  <TableRow key={row.id ?? row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.qty}</TableCell>
                    <TableCell align="right">{row.unit}</TableCell>
                    <TableCell align="right">{row.expiry ? new Date(row.expiry).toLocaleDateString() : '-'}</TableCell>
                    <TableCell align="right">{currency(Number(row.cost || 0))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setShowInventoryDialog(false)} 
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Expiring Soon Dialog */}
      <Dialog 
        open={showExpiringDialog} 
        onClose={() => setShowExpiringDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, fontWeight: 700 }}>Expiring Within 7 Days</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {(() => {
            const now = new Date();
            const soonItems = (inventoryList || []).filter((r) => {
              if (!r?.expiry) return false;
              const d = new Date(r.expiry);
              if (isNaN(d.getTime())) return false;
              const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
              return days <= 7 && days >= 0;
            }).sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
            if (soonItems.length === 0) return <Typography color="text.secondary">No items expiring within 7 days.</Typography>;
            return (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit</TableCell>
                    <TableCell align="right">Expiry</TableCell>
                    <TableCell align="right">Days Left</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {soonItems.map((r) => {
                    const d = new Date(r.expiry);
                    const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={r.id ?? r.name}>
                        <TableCell>{r.name}</TableCell>
                        <TableCell align="right">{r.qty}</TableCell>
                        <TableCell align="right">{r.unit}</TableCell>
                        <TableCell align="right">{d.toLocaleDateString()}</TableCell>
                        <TableCell align="right">{days}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setShowExpiringDialog(false)} 
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Financial Overview Chart - Left Side */}
      <Grid item xs={12} lg={7}>
        <Card
          sx={{
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
              height: '100%',
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
        </Grid>

        {/* Sales Analytics - Right Side */}
        <Grid item xs={12} lg={5}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <SectionTitle
                icon={PieChart}
                title="Sales Analytics"
                hint="Visual breakdown and performance metrics for top and slow-moving items"
              />
              
              {/* Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <HintTooltip hint="Filter sales data by time period">
                    <FormControl fullWidth size="small">
                      <InputLabel>Time Period</InputLabel>
                      <Select
                        value={timePeriodFilter}
                        label="Time Period"
                        onChange={(e) => setTimePeriodFilter(e.target.value)}
                        sx={{ borderRadius: '10px' }}
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="7days">Last 7 Days</MenuItem>
                        <MenuItem value="30days">Last 30 Days</MenuItem>
                        <MenuItem value="90days">Last 90 Days</MenuItem>
                      </Select>
                    </FormControl>
                  </HintTooltip>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <HintTooltip hint="Sort items by quantity sold, revenue generated, or order frequency">
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{ borderRadius: '10px' }}
                      >
                        <MenuItem value="quantity">Quantity Sold</MenuItem>
                        <MenuItem value="revenue">Revenue</MenuItem>
                        <MenuItem value="frequency">Order Frequency</MenuItem>
                      </Select>
                    </FormControl>
                  </HintTooltip>
                </Grid>

                <Grid item xs={12}>
                  <HintTooltip hint="Set minimum quantity threshold to filter out low-volume items">
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Min Quantity: {minQuantity}
                      </Typography>
                      <Slider
                        value={minQuantity}
                        onChange={(e, newValue) => setMinQuantity(newValue)}
                        min={0}
                        max={50}
                        step={5}
                        marks={[
                          { value: 0, label: '0' },
                          { value: 25, label: '25' },
                          { value: 50, label: '50' },
                        ]}
                        valueLabelDisplay="auto"
                        sx={{ 
                          mt: 1,
                          '& .MuiSlider-thumb': {
                            backgroundColor: '#8b0000',
                          },
                          '& .MuiSlider-track': {
                            backgroundColor: '#8b0000',
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: '#e2e8f0',
                          },
                        }}
                      />
                    </Box>
                  </HintTooltip>
                </Grid>
              </Grid>

              {/* Pie Chart */}
              {pieChartData.length > 0 ? (
                <Box sx={{ height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${percent.toFixed(1)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} units`} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: '10px' }}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No sales data available.<br />Save orders from the Order Scanner to see distribution.
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2.5 }} />

              {/* Top Sellers & Slow Movers - Compact View */}
              {salesAnalysis.itemStats.length > 0 && (
                <Grid container spacing={2.5}>
                  {/* Top Sellers */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Trophy size={18} color="#4caf50" />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
                        Top Sellers
                      </Typography>
                      <Chip label={salesAnalysis.bestSellers.length} color="success" size="small" />
                    </Box>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem' }}>Item</TableCell>
                          <TableCell align="right" sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem' }}>Qty</TableCell>
                          <TableCell align="right" sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem' }}>Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {salesAnalysis.bestSellers.slice(0, 3).map((item, idx) => (
                          <TableRow 
                            key={idx} 
                            sx={{ 
                              backgroundColor: idx === 0 ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                            }}
                          >
                            <TableCell sx={{ py: 1 }}>
                              <Typography variant="body2" fontWeight={idx === 0 ? 600 : 400} noWrap>
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1 }}>
                              <Typography variant="body2" fontWeight={500}>{item.quantity}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1 }}>
                              <Typography variant="body2" color="success.main" fontWeight={500}>
                                {currency(item.revenue)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>

                  {/* Slow Movers */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <AlertCircle size={18} color="#ff9800" />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
                        Slow Movers
                      </Typography>
                      <Chip label={salesAnalysis.worstSellers.length} color="warning" size="small" />
                    </Box>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem' }}>Item</TableCell>
                          <TableCell align="right" sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem' }}>Qty</TableCell>
                          <TableCell align="right" sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem' }}>Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {salesAnalysis.worstSellers.slice(0, 3).map((item, idx) => (
                          <TableRow 
                            key={idx} 
                            sx={{ 
                              backgroundColor: idx === 0 ? 'rgba(255, 152, 0, 0.05)' : 'transparent',
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                            }}
                          >
                            <TableCell sx={{ py: 1 }}>
                              <Typography variant="body2" fontWeight={idx === 0 ? 600 : 400} noWrap>
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1 }}>
                              <Typography variant="body2" fontWeight={500}>{item.quantity}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1 }}>
                              <Typography variant="body2" color="warning.main" fontWeight={500}>
                                {currency(item.revenue)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications Panel */}
        <Grid item xs={12} lg={12}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
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
        </Grid>
      </Grid>
    </Box>
  );
}
