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
import { toBaseQty } from "./units.js";
import { listRecipes } from "./recipesService.js";
import { weeklySales, addSale } from "./analyticsService.js";
import HintTooltip from "./HintTooltip.jsx";

import {
  ResponsiveContainer,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";

// PDF generation libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // Report generation state
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState(null);

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

  /**
   * Handle adding a manual sale entry
   * Adds sale to database and refreshes weekly sales chart
   */
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

  /**
   * Generate comprehensive report
   * Aggregates all data (inventory, recipes, sales) into a structured report
   * This prepares the data for display or export to PDF/CSV
   */
  const handleGenerateReport = () => {
    // Calculate report metrics
    const totalInventoryValue = inv.reduce((sum, it) => {
      // Inventory valuation = current quantity (in base units) × price per base unit (ppu)
      const qtyBase = toBaseQty(it.qty || 0, it.unit);
      let ppu = Number(it?.ppu ?? NaN);
      if (!Number.isFinite(ppu) || ppu <= 0) {
        // Fallback for legacy rows without ppu: derive from total cost and purchased qty
        const u = (it.unit || '').toLowerCase();
        const factor = u === 'kg' || u === 'l' ? 1000 : 1;
        const denom = (Number(it.qty || 0) * factor) || 1; // avoid div/0
        ppu = Number(it.cost || 0) / denom;
      }
      const val = Number.isFinite(qtyBase) && Number.isFinite(ppu) ? ppu * qtyBase : 0;
      return sum + val;
    }, 0);

    const totalWeeklySales = week.reduce((sum, day) => sum + Number(day.sales || 0), 0);
    const totalWeeklyCosts = week.reduce((sum, day) => sum + Number(day.costs || 0), 0);
    const weeklyProfit = totalWeeklySales - totalWeeklyCosts;

    // Count items expiring soon (within 7 days)
    const now = new Date();
    const expiringSoonCount = inv.filter(item => {
      if (!item?.expiry) return false;
      const d = new Date(item.expiry);
      if (isNaN(d.getTime())) return false;
      const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      return days <= 7 && days >= 0;
    }).length;

    // Low stock items (items below reorder threshold), unit-aware
    const lowStockCount = inv.filter(item => {
      const qtyBase = (() => {
        const u = (item.unit || '').toLowerCase();
        const factor = u === 'kg' || u === 'l' ? 1000 : 1;
        return Number(item.qty || 0) * factor;
      })();
      const thresholdBase = (() => {
        const rb = Number(item.reorderBase || NaN);
        if (isFinite(rb) && rb > 0) return rb;
        const legacy = Number(item.reorder || NaN);
        if (isFinite(legacy) && legacy > 0) {
          const u = (item.unit || '').toLowerCase();
          const factor = u === 'kg' || u === 'l' ? 1000 : 1;
          return legacy * factor;
        }
        return NaN;
      })();
      return isFinite(thresholdBase) && thresholdBase > 0 && qtyBase <= thresholdBase;
    }).length;

    // Package report data
    const report = {
      generatedAt: new Date().toLocaleString("en-ZA"),
      dateRange: start && end ? `${start} to ${end}` : "All Time",
      summary: {
        totalRecipes: recipes.length,
        totalInventoryItems: inv.length,
        inventoryValue: totalInventoryValue,
        weeklyEntries: week.length,
        totalWeeklySales,
        totalWeeklyCosts,
        weeklyProfit,
        expiringSoonCount,
        lowStockCount,
      },
      inventory: inv,
      recipes: recipes,
      weeklySales: week,
      dishProfitability: dishProfitRows,
    };

    setReportData(report);
    setReportGenerated(true);
    
    // Show success message
    alert(`Report generated successfully!\n\nTotal Sales: ${currency(totalWeeklySales)}\nWeekly Profit: ${currency(weeklyProfit)}\nInventory Items: ${inv.length}`);
  };

  /**
   * Export report data to CSV format
   * Creates downloadable CSV file with sales and inventory data
   * CSV is human-readable and can be opened in Excel or Google Sheets
   */
  const handleExportCSV = () => {
    if (!reportGenerated || !reportData) {
      alert("Please generate a report first before exporting.");
      return;
    }

      // Prepare CSV content with multiple sections
      let csvContent = "Mario's Italian Restaurant - Business Report\n";
    csvContent += `Generated: ${reportData.generatedAt}\n`;
    csvContent += `Date Range: ${reportData.dateRange}\n\n`;

    // Summary section
    csvContent += "SUMMARY METRICS\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Recipes,${reportData.summary.totalRecipes}\n`;
    csvContent += `Total Inventory Items,${reportData.summary.totalInventoryItems}\n`;
    csvContent += `Inventory Value,${reportData.summary.inventoryValue.toFixed(2)}\n`;
    csvContent += `Weekly Sales,${reportData.summary.totalWeeklySales.toFixed(2)}\n`;
    csvContent += `Weekly Costs,${reportData.summary.totalWeeklyCosts.toFixed(2)}\n`;
    csvContent += `Weekly Profit,${reportData.summary.weeklyProfit.toFixed(2)}\n`;
    csvContent += `Items Expiring Soon,${reportData.summary.expiringSoonCount}\n`;
    csvContent += `Low Stock Items,${reportData.summary.lowStockCount}\n\n`;

    // Weekly sales section
    csvContent += "WEEKLY SALES\n";
    csvContent += "Day,Sales (ZAR),Costs (ZAR),Profit (ZAR)\n";
    reportData.weeklySales.forEach(day => {
      const profit = (Number(day.sales || 0) - Number(day.costs || 0)).toFixed(2);
      csvContent += `${day.day},${day.sales.toFixed(2)},${day.costs.toFixed(2)},${profit}\n`;
    });
    csvContent += "\n";

    // Inventory section: include Unit Cost (ppu) and computed Value
    csvContent += "INVENTORY\n";
    csvContent += "Name,Quantity,Unit,Expiry,Unit Cost (ZAR),Value (ZAR)\n";
    reportData.inventory.forEach(item => {
      const qtyBase = toBaseQty(item.qty || 0, item.unit);
      let ppu = Number(item?.ppu ?? NaN);
      if (!Number.isFinite(ppu) || ppu <= 0) {
        const u = (item.unit || '').toLowerCase();
        const factor = u === 'kg' || u === 'l' ? 1000 : 1;
        const denom = (Number(item.qty || 0) * factor) || 1;
        ppu = Number(item.cost || 0) / denom;
      }
      const value = Number.isFinite(qtyBase) && Number.isFinite(ppu) ? ppu * qtyBase : 0;
      csvContent += `"${item.name}",${item.qty},${item.unit},${item.expiry || 'N/A'},${ppu.toFixed(2)},${value.toFixed(2)}\n`;
    });
    csvContent += "\n";

    // Recipes section
    csvContent += "RECIPES\n";
    csvContent += "Name,Type,Cost (ZAR)\n";
    reportData.recipes.forEach(recipe => {
      csvContent += `"${recipe.name}",${recipe.type || 'N/A'},${(recipe.cost || 0).toFixed(2)}\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `INSY7315_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Export report data to PDF format
   * Creates professionally formatted PDF with tables and summary metrics
   * Uses jsPDF and jspdf-autotable for enhanced table rendering
   */
  const handleExportPDF = () => {
    if (!reportGenerated || !reportData) {
      alert("Please generate a report first before exporting.");
      return;
    }

    // Initialize PDF document (A4 size, portrait orientation)
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20; // Current Y position for content placement

    // Header
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("Mario's Italian Restaurant - Business Report", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Generated: ${reportData.generatedAt}`, pageWidth / 2, yPos, { align: "center" });
    doc.text(`Date Range: ${reportData.dateRange}`, pageWidth / 2, yPos + 5, { align: "center" });
    
    yPos += 20;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Summary Metrics", 14, yPos);
    yPos += 5;

    // Summary table
    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value"]],
      body: [
        ["Total Recipes", reportData.summary.totalRecipes.toString()],
        ["Total Inventory Items", reportData.summary.totalInventoryItems.toString()],
        ["Inventory Value", currency(reportData.summary.inventoryValue)],
        ["Weekly Sales", currency(reportData.summary.totalWeeklySales)],
        ["Weekly Costs", currency(reportData.summary.totalWeeklyCosts)],
        ["Weekly Profit", currency(reportData.summary.weeklyProfit)],
        ["Items Expiring Soon", reportData.summary.expiringSoonCount.toString()],
        ["Low Stock Items", reportData.summary.lowStockCount.toString()],
      ],
      theme: "grid",
      headStyles: { fillColor: [139, 0, 0] },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Weekly Sales Section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Weekly Sales", 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [["Day", "Sales (ZAR)", "Costs (ZAR)", "Profit (ZAR)"]],
      body: reportData.weeklySales.map(day => [
        day.day,
        day.sales.toFixed(2),
        day.costs.toFixed(2),
        (day.sales - day.costs).toFixed(2),
      ]),
      theme: "striped",
      headStyles: { fillColor: [139, 0, 0] },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Add new page if needed for inventory
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Inventory Section (show unit cost and computed value per row)
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Inventory", 14, yPos);
    yPos += 5;

    // Prepare inventory rows with unit cost (ppu) and value (ppu * qtyBase)
    const invRows = reportData.inventory.map(item => {
      // qty in base units
      const qtyBase = toBaseQty(item.qty || 0, item.unit);
      let ppu = Number(item?.ppu ?? NaN);
      if (!Number.isFinite(ppu) || ppu <= 0) {
        // Fallback: derive ppu from total batch cost and the stored purchase quantity
        // If ppu is missing and qty reflects the current remaining quantity, the
        // safest approximation is to treat the batch cost as the value for remaining
        // quantity (so the per-unit cost equals cost / (qty * factor)). This mirrors
        // how ppu is calculated when items are added, but note this is still a
        // fallback — ideally ppu should be stored at add time.
        const u = (item.unit || '').toLowerCase();
        const factor = u === 'kg' || u === 'l' ? 1000 : 1;
        const denom = (Number(item.qty || 0) * factor) || 1; // avoid div/0
        ppu = Number(item.cost || 0) / denom;
      }
      const value = Number.isFinite(qtyBase) && Number.isFinite(ppu) ? ppu * qtyBase : 0;
      return [
        item.name,
        item.qty.toString(),
        item.unit,
        item.expiry || "N/A",
        currency(ppu),
        currency(value),
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [["Name", "Qty", "Unit", "Expiry", "Unit Cost (ZAR)", "Value (ZAR)"]],
      body: invRows,
      theme: "striped",
      headStyles: { fillColor: [139, 0, 0] },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Add new page if needed for recipes
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Recipes Section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Recipes", 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [["Name", "Type", "Cost (ZAR)"]],
      body: reportData.recipes.map(recipe => [
        recipe.name,
        recipe.type || "N/A",
        (recipe.cost || 0).toFixed(2),
      ]),
      theme: "striped",
      headStyles: { fillColor: [139, 0, 0] },
      margin: { left: 14, right: 14 },
    });

    // Save PDF with timestamp in filename — create blob and trigger download for
    // better compatibility (browser + Electron renderer environments)
      const filename = `Marios_Italian_Restaurant_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    try {
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback to jsPDF save if blob method fails
      doc.save(filename);
    }
  };

  // derived metrics
  const inventoryValue = useMemo(() => {
    return inv.reduce((sum, it) => {
      const qtyBase = toBaseQty(it.qty || 0, it.unit);
      let ppu = Number(it?.ppu ?? NaN);
      if (!Number.isFinite(ppu) || ppu <= 0) {
        const u = (it.unit || '').toLowerCase();
        const factor = u === 'kg' || u === 'l' ? 1000 : 1;
        const denom = (Number(it.qty || 0) * factor) || 1;
        ppu = Number(it.cost || 0) / denom;
      }
      const val = Number.isFinite(qtyBase) && Number.isFinite(ppu) ? ppu * qtyBase : 0;
      return sum + val;
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
        {/* Generate Report button - aggregates all data into structured report */}
        <HintTooltip title="Generate a comprehensive report with all inventory, recipes, and sales data">
          <Button variant="contained" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </HintTooltip>
        
        {/* Export PDF button - creates downloadable PDF with formatted tables */}
        <HintTooltip title="Export the generated report as a professionally formatted PDF file">
          <Button variant="outlined" onClick={handleExportPDF} disabled={!reportGenerated}>
            Export PDF
          </Button>
        </HintTooltip>
        
        {/* Export CSV button - creates downloadable CSV for Excel/Sheets */}
        <HintTooltip title="Export the generated report as a CSV file for use in Excel or Google Sheets">
          <Button variant="outlined" onClick={handleExportCSV} disabled={!reportGenerated}>
            Export CSV
          </Button>
        </HintTooltip>

        {/* Quick Add Sale */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField type="date" label="Sale Date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField type="number" label="Amount (ZAR)" value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} inputProps={{ min: 0, step: '0.01' }} />
          <TextField type="number" label="Cost (ZAR)" value={saleCost} onChange={(e) => setSaleCost(e.target.value)} inputProps={{ min: 0, step: '0.01' }} />
          <HintTooltip title="Add a manual sale entry to the database. This will update the weekly chart and dashboard metrics.">
            <Button variant="outlined" color="error" onClick={handleAddSale} disabled={!saleAmount}>Add Sale</Button>
          </HintTooltip>
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
