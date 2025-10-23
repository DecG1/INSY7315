// ReportsPage: analytics & summaries from local DB (no mock data)
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import SectionTitle from "./SectionTitle.jsx";
import MetricCard from "./MetricCard.jsx";
import StatusChip from "./StatusChip.jsx";
import { currency } from "./helpers.js";

import { listInventory } from "./inventoryService.js";
import { listRecipes } from "./recipesService.js";
import { weeklySales, addSale } from "./analyticsService.js";

import {
  ResponsiveContainer,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";

export default function ReportsPage() {
  // date range inputs (not wired to filters yet)
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // db-driven state
  const [inv, setInv] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [week, setWeek] = useState([]); // [{day, sales, costs}]
  // quick add sale form
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleAmount, setSaleAmount] = useState("");
  const [saleCost, setSaleCost] = useState("");

  useEffect(() => {
    (async () => {
      const [i, r, w] = await Promise.all([
        listInventory(),
        listRecipes(),
        weeklySales(),
      ]);
      setInv(i);
      setRecipes(r);
      setWeek(w);
    })();
  }, []);

  async function handleAddSale() {
    if (!saleAmount) return;
    await addSale({
      date: new Date(saleDate).toISOString(),
      amount: Number(saleAmount),
      cost: Number(saleCost || 0),
    });
    const w = await weeklySales();
    setWeek(w);
    setSaleAmount("");
    setSaleCost("");
  }

  // derived metrics
  const inventoryValue = useMemo(() => {
    // if you normalized ppu (price per base unit), use qty converted to the same base unit
    // here we assume inventory cost is for the stored unit; if you added ppu, prefer ppu * qty_in_base
    return inv.reduce((sum, it) => {
      // simplest: qty * cost (cost per unit)
      const qty = Number(it.qty || 0);
      const unitCost = Number(it.cost || 0);
      return sum + qty * unitCost;
    }, 0);
  }, [inv]);

  // example “dish profitability” computed from saved recipe.cost if you set it on save
  const dishProfitRows = useMemo(() => {
    // If you track sales per recipe elsewhere, you can join here.
    // For now we just display recipe name and estimated cost; profit columns empty.
    return recipes.map(r => ({
      dish: r.name,
      cost: Number(r.cost || 0),
      sales: 0, // fill from your sales/orders table if/when you add it
      profit: 0,
      tag: "Medium", // placeholder tag logic removed; keep a neutral tag
    }));
  }, [recipes]);

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        animation: 'fadeIn 0.6s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <SectionTitle title="Reports & Analytics" />

      {/* Date range controls (UI only for now) + quick add sale */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", flexWrap: 'wrap' }}>
        <TextField
          type="month"
          label="Start"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <TextField
          type="month"
          label="End"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <Button variant="contained">Generate Report</Button>
        <Button variant="outlined">Export PDF</Button>
        <Button variant="outlined">Export CSV</Button>

        {/* Quick Add Sale */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField type="date" label="Sale Date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField type="number" label="Amount (ZAR)" value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} inputProps={{ min: 0, step: '0.01' }} />
          <TextField type="number" label="Cost (ZAR)" value={saleCost} onChange={(e) => setSaleCost(e.target.value)} inputProps={{ min: 0, step: '0.01' }} />
          <Button variant="outlined" color="error" onClick={handleAddSale} disabled={!saleAmount}>Add Sale</Button>
        </Box>
      </Box>

      {/* Metric cards (computed from DB) */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Recipes Saved"
            value={recipes.length}
            note="Total recipes in local DB"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Inventory Items"
            value={inv.length}
            note="Tracked items"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Inventory Value"
            value={currency(inventoryValue)}
            note="Qty × Unit cost"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Weekly Entries"
            value={week.length}
            note="Sales points this week"
          />
        </Grid>
      </Grid>

      {/* Weekly sales chart (only if there is data) */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Weekly Financial Overview
          </Typography>
          {week.length > 0 ? (
            <Box sx={{ height: 260 }}>
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
              No weekly sales data yet. Add sales entries to see this chart.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Dish profitability table (no mock data) */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Dish Profitability
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dish</TableCell>
                <TableCell>Sales (ZAR)</TableCell>
                <TableCell>Cost (ZAR)</TableCell>
                <TableCell>Profit (ZAR)</TableCell>
                <TableCell>Tag</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dishProfitRows.map((d) => (
                <TableRow key={d.dish}>
                  <TableCell>{d.dish}</TableCell>
                  <TableCell>{currency(d.sales)}</TableCell>
                  <TableCell>{currency(d.cost)}</TableCell>
                  <TableCell>{currency(d.profit)}</TableCell>
                  <TableCell>
                    <StatusChip label={d.tag} />
                  </TableCell>
                </TableRow>
              ))}
              {dishProfitRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">
                      No recipes yet. Create some recipes to analyze their costs and profitability.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
