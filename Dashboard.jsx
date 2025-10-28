import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import {
  BarChart3, AlertTriangle, CalendarClock, PackageX, DollarSign, RefreshCw
} from "lucide-react";

import MetricCard from "./MetricCard.jsx";
import SectionTitle from "./SectionTitle.jsx";
import { currency } from "./helpers.js";
import HintTooltip from "./HintTooltip.jsx";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { countInventory, countRecipes, weeklySales, monthlySales, yearlySales, countOrdersToday } from "./analyticsService.js";

export default function Dashboard() {
  const [invCount, setInvCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0); // optional calc
  const [ordersToday, setOrdersToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [chartData, setChartData] = useState([]);                 // chart data from DB
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState('weekly'); // Current period: 'weekly', 'monthly', or 'yearly'
  
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
      const [ic, rc, salesData, ot] = await Promise.all([
        countInventory(),
        countRecipes(),
        fetchSalesData(period), // Fetch sales for current period
        countOrdersToday(),
      ]);
      setInvCount(ic);
      setRecipeCount(rc);

      setChartData(salesData);
      setOrdersToday(ot);
      
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

      setExpiringSoon(0);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Re-fetch data when component mounts or when period changes
  useEffect(() => {
    fetchData();
  }, [period]); // Re-fetch when period changes
  
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
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        animation: 'fadeIn 0.6s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
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
          <MetricCard title="Expiring Soon" value={expiringSoon} note="(not calculated yet)" icon={PackageX} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard title="Daily Revenue" value={currency(revenueToday)} note="From local sales table" icon={DollarSign} />
        </Grid>
      </Grid>

      {/* Financial overview chart with period selector */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
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
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2,
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
                    startIcon={<RefreshCw size={14} />} 
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
    </Box>
  );
}
