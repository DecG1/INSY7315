
// ReportsPage: displays analytics, charts, and profitability tables
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import { brandRed, lightPink } from "./helpers.js"; 

/**
 * ReportsPage
 * - Shows analytics, charts, and profitability tables
 * - Uses mock data for all reports
 */
const ReportsPage = () => {
  // State for report date range
  const [start, setStart] = useState("2025-01");
  const [end, setEnd] = useState("2025-08");

  return (
    <Box className="p-6 space-y-4">
      {/* Page title */}
      <SectionTitle icon={BarChart3} title="Reports & Analytics" />

      {/* Date range and export controls */}
      <Box className="flex items-end gap-2">
        <TextField type="month" label="Start" value={start} onChange={(e) => setStart(e.target.value)} />
        <TextField type="month" label="End" value={end} onChange={(e) => setEnd(e.target.value)} />
        <Button variant="contained" color="error">Generate Report</Button>
        <Button variant="outlined">Export PDF</Button>
        <Button variant="outlined">Export CSV</Button>
      </Box>

      {/* Metric cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><MetricCard title="Total Profit (YTD)" value={currency(125450)} note="↑ 12.5% from last year" /></Grid>
        <Grid item xs={12} md={3}><MetricCard title="Average Dish Cost" value={currency(45.20)} note="Stable vs last quarter" /></Grid>
        <Grid item xs={12} md={3}><MetricCard title="Current Inventory Value" value={currency(18300)} /></Grid>
        <Grid item xs={12} md={3}><MetricCard title="Ingredient Waste" value={"5.8%"} note="↓ 0.5% this month" /></Grid>
      </Grid>

      {/* Profit & Loss and Ingredient Cost Trends charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700}>Profit & Loss Overview</Typography>
              <Box className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyFinances}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(v) => currency(v)} />
                    <Line type="monotone" dataKey="sales" name="Profit" stroke="#4caf50" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700}>Ingredient Cost Trends</Typography>
              <Box className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="tomatoes" name="Tomatoes" stroke="#2196f3" strokeWidth={2} dot={false} />
                    <Line dataKey="mozzarella" name="Mozzarella" stroke="#4caf50" strokeWidth={2} dot={false} />
                    <Line dataKey="flour" name="Flour" stroke="#f44336" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory depletion chart */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700}>Inventory Depletion Rate</Typography>
          <Box className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depletion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="item" />
                <Tooltip />
                <Bar dataKey="qty" name="Qty" fill="#8b0000" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Dish profitability table */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700}>Dish Profitability Analysis</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dish</TableCell>
                <TableCell>Sales (ZAR)</TableCell>
                <TableCell>Cost (ZAR)</TableCell>
                <TableCell>Profit (ZAR)</TableCell>
                <TableCell>Profitability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Render each dish row */}
              {dishProfitability.map((d) => (
                <TableRow key={d.dish}>
                  <TableCell>{d.dish}</TableCell>
                  <TableCell>{currency(d.sales)}</TableCell>
                  <TableCell>{currency(d.cost)}</TableCell>
                  <TableCell>{currency(d.profit)}</TableCell>
                  <TableCell>
                    {d.tag === "High" && <StatusChip label="High" color="success" />}
                    {d.tag === "Medium" && <StatusChip label="Medium" color="warning" />}
                    {d.tag === "Low" && <StatusChip label="Low" color="error" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box className="mt-3">
            <Button variant="outlined">View Recipes</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsPage;
