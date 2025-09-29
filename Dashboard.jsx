import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import {
  BarChart3, AlertTriangle, CalendarClock, PackageX, DollarSign, Bell,
  ChefHat, QrCode, Boxes, Users
} from "lucide-react";

import MetricCard from "./MetricCard.jsx";
import SectionTitle from "./SectionTitle.jsx";
import { currency } from "./helpers.js";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { countInventory, countRecipes, listNotifications, weeklySales } from "./analyticsService.js";

export default function Dashboard() {
  const [invCount, setInvCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0); // optional calc
  const [ordersToday] = useState(0);                    // placeholder unless you track orders
  const [revenueToday, setRevenueToday] = useState(0);
  const [notif, setNotif] = useState([]);
  const [week, setWeek] = useState([]);                 // chart data from DB

  useEffect(() => {
    (async () => {
      const [ic, rc, nn, ws] = await Promise.all([
        countInventory(),
        countRecipes(),
        listNotifications(),
        weeklySales(),
      ]);
      setInvCount(ic);
      setRecipeCount(rc);
      setNotif(nn);

      setWeek(ws);
      // derive today's revenue from sales entries with today's date
      const todayStr = new Date().toDateString();
      const todayBucket = ws.find(d => d.day === ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()]);
      setRevenueToday(todayBucket ? todayBucket.sales : 0);

      // optional: compute expiringSoon from inventory in separate query if you want
      // leaving as 0 unless you implement it
      setExpiringSoon(0);
    })();
  }, []);

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Metric cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <MetricCard title="Low Stock Items" value={invCount} note="Total inventory items" icon={AlertTriangle} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard title="Orders Today" value={ordersToday} note="(not tracked yet)" icon={CalendarClock} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard title="Expiring Soon" value={expiringSoon} note="(not calculated yet)" icon={PackageX} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard title="Daily Revenue" value={currency(revenueToday)} note="From local sales table" icon={DollarSign} />
        </Grid>
      </Grid>

      {/* Weekly financial overview chart */}
      <Card>
        <CardContent>
          <SectionTitle icon={BarChart3} title="Weekly Financial Overview" />
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

      {/* Notifications and quick actions */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle icon={Bell} title="Notifications & Alerts" />
              <Box sx={{ display: "grid", gap: 1 }}>
                {notif.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
                ) : (
                  notif.map((n) => (
                    <Box key={n.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {n.tone === "error" && <AlertTriangle size={16} />} {n.msg}
                      </Box>
                      <Typography variant="caption" color="text.secondary">{n.ago || ""}</Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle title="Quick Actions" />
              <Grid container spacing={2}>
                {[
                  { label: "Add Recipe", icon: ChefHat },
                  { label: "Scan Order", icon: QrCode },
                  { label: "View Inventory", icon: Boxes },
                  { label: "Manage Prices", icon: DollarSign },
                  { label: "Reports", icon: BarChart3 },
                  { label: "Loyalty Program", icon: Users },
                ].map((a) => (
                  <Grid item xs={6} md={4} key={a.label}>
                    <Button fullWidth variant="outlined" startIcon={<a.icon size={16} />}>{a.label}</Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
