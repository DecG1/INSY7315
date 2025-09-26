// Dashboard page: shows key metrics, charts, and quick actions
import React from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";

// ⬇️ FIXED: these files are in the SAME folder; add explicit extensions
import MetricCard from "./MetricCard.jsx";
import SectionTitle from "./SectionTitle.jsx";

// Icons (lucide-react)
import {
  BarChart3,
  AlertTriangle,
  CalendarClock,
  PackageX,
  DollarSign,
  Bell,
  ChefHat,
  QrCode,
  Boxes,
  Users,
} from "lucide-react";

// ⬇️ FIXED: helpers & data are local .js files
import { currency } from "./helpers.js";
import { weeklyFinances, mockNotifications } from "./mockData.js";

// Charts (Recharts)
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  // Example metrics (would be dynamic in real app)
  const lowStockCount = 12;
  const ordersToday = 28;
  const expiringSoon = 5;
  const revenue = 2450;

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Metric cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Low Stock Items"
            value={lowStockCount}
            note="Ingredients below reorder threshold"
            icon={AlertTriangle}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Orders Today"
            value={ordersToday}
            note="Completed & Pending"
            icon={CalendarClock}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Expiring Soon"
            value={expiringSoon}
            note="Items expiring within 7 days"
            icon={PackageX}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Daily Revenue"
            value={currency(revenue)}
            note="Estimated sales for today"
            icon={DollarSign}
          />
        </Grid>
      </Grid>

      {/* Weekly financial overview chart */}
      <Card>
        <CardContent>
          <SectionTitle icon={BarChart3} title="Weekly Financial Overview" />
          <Box sx={{ height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyFinances}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(v) => currency(v)} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#8b0000"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="costs"
                  name="Costs"
                  stroke="#ffcdd2"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Notifications and quick actions */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle icon={Bell} title="Notifications & Alerts" />
              <Box sx={{ display: "grid", gap: 8 }}>
                {mockNotifications.map((n) => (
                  <Box
                    key={n.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {n.tone === "error" && <AlertTriangle size={16} />} {n.msg}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {n.ago} ago
                    </Typography>
                  </Box>
                ))}
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
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<a.icon size={16} />}
                    >
                      {a.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
