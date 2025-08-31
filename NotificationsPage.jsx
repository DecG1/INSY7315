
// NotificationsPage: displays alerts, toggles, and notification history
import React, { useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Switch, Table, TableHead, TableRow, TableCell, TableBody, Divider } from "@mui/material";
import { Bell } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import StatusChip from "../components/StatusChip";
import { brandRed } from "../utils/helpers";

/**
 * NotificationsPage
 * - Shows alert toggles, critical/urgent alerts, and notification history
 * - Uses mock data for alert history
 */
const NotificationsPage = () => {
  // State for toggling soon-to-expire and low stock alerts
  const [soon, setSoon] = useState(true);
  const [lowStock, setLowStock] = useState(true);

  // Mock notification history
  const history = [
    { date: "2024-07-28", time: "10:30", type: "Expiry", item: "Fresh Mozzarella", details: "Expired", status: "Resolved" },
    { date: "2024-07-27", time: "09:00", type: "Depletion", item: "San Marzano Tomatoes", details: "Low stock (3 cans)", status: "Acknowledged" },
  ];

  return (
    <Box className="p-6 space-y-4">
      {/* Page title */}
      <SectionTitle icon={Bell} title="Notifications & Alerts" />

      {/* Alert toggles */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle title="Expiry Alert" action={<Button variant="outlined">View All Expiry Alerts</Button>} />
              <Typography variant="body2" className="mb-2">2 Critical Alerts, 5 Upcoming</Typography>
              <Box className="flex items-center gap-2">
                <Switch checked={soon} onChange={() => setSoon(v => !v)} /> Enable Soon-to-Expire/Expired Alerts
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle title="Inventory Depletion" action={<Button variant="outlined">View All Low Stock Alerts</Button>} />
              <Typography variant="body2" className="mb-2">1 Low Stock Alert</Typography>
              <Box className="flex items-center gap-2">
                <Switch checked={lowStock} onChange={() => setLowStock(v => !v)} /> Enable Low Stock Alerts
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical and urgent alerts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderLeft: `6px solid ${brandRed}` }}>
            <CardContent>
              <Typography variant="overline" color="error">CRITICAL</Typography>
              <Typography variant="subtitle1" fontWeight={700}>Expired Ingredient – San Daniele Prosciutto (500g)</Typography>
              <Typography variant="body2" color="text.secondary">Expired July 28, 2024</Typography>
              <Box className="flex gap-2 mt-2">
                <Button variant="outlined" color="error">Action Required</Button>
                <Button variant="contained" color="error">Resolve</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderLeft: "6px solid #ff9800" }}>
            <CardContent>
              <Typography variant="overline" color="warning.main">URGENT</Typography>
              <Typography variant="subtitle1" fontWeight={700}>Low Stock – Italian Sausage (Spicy)</Typography>
              <Typography variant="body2" color="text.secondary">0.5 kg remaining</Typography>
              <Box className="flex gap-2 mt-2">
                <Button variant="outlined">Review Soon</Button>
                <Button variant="contained">View Item</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notification history table */}
      <Card>
        <CardContent>
          <SectionTitle title="Notification History" />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Render each history row */}
              {history.map((h, i) => (
                <TableRow key={i}>
                  <TableCell>{h.date}</TableCell>
                  <TableCell>{h.time}</TableCell>
                  <TableCell>{h.type}</TableCell>
                  <TableCell>{h.item}</TableCell>
                  <TableCell>{h.details}</TableCell>
                  <TableCell>
                    {h.status === "Resolved" && <StatusChip label="Resolved" color="success" />}
                    {h.status === "Acknowledged" && <StatusChip label="Acknowledged" color="error" />}
                    {h.status === "Dismissed" && <StatusChip label="Dismissed" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationsPage;
