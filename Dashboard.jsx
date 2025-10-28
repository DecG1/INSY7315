import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import {
  BarChart3, AlertTriangle, CalendarClock, PackageX, DollarSign, RefreshCw
} from "lucide-react";

import MetricCard from "./MetricCard.jsx";
import SectionTitle from "./SectionTitle.jsx";
import { currency } from "./helpers.js";
import HintTooltip from "./HintTooltip.jsx";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { countInventory, countRecipes, weeklySales, countOrdersToday } from "./analyticsService.js";

export default function Dashboard() {
  const [invCount, setInvCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0); // optional calc
  const [ordersToday, setOrdersToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [week, setWeek] = useState([]);                 // chart data from DB
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [ic, rc, ws, ot] = await Promise.all([
        countInventory(),
        countRecipes(),
        weeklySales(),
        countOrdersToday(),
      ]);
      setInvCount(ic);
      setRecipeCount(rc);

      setWeek(ws);
      setOrdersToday(ot);
      const todayBucket = ws.find(
        (d) => d.day === ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()]
      );
      setRevenueToday(todayBucket ? todayBucket.sales : 0);

      setExpiringSoon(0);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

      {/* Weekly financial overview chart */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <SectionTitle 
            icon={BarChart3} 
            title="Weekly Financial Overview"
            action={
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
            }
          />
          {week.length > 0 ? (
            <Box sx={{ height: 256 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={week}>
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
