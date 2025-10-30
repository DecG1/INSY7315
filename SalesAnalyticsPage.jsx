import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
  import { TrendingUp, TrendingDown, BarChart3, RefreshCw, Trophy, AlertCircle } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { getOrderHistory } from "./analyticsService";
import HintTooltip from "./HintTooltip";

/**
 * SalesAnalyticsPage Component
 * 
 * Analyzes sales data to identify best-selling and least-selling items
 * Provides insights into product performance and revenue contribution
 * 
 * Features:
 * - Best-selling items ranked by quantity sold
 * - Least-selling items to identify slow movers
 * - Revenue contribution analysis
 * - Time period filtering (all time, last 7 days, last 30 days)
 * - Visual ranking with color-coded indicators
 * - Percentage contribution to total sales
 * 
 * @returns {JSX.Element} Sales analytics page component
 */
export default function SalesAnalyticsPage() {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState("all"); // all, 7days, 30days

  /**
   * Load order history on component mount
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Fetch order history from the database
   */
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const orderData = await getOrderHistory();
      setOrders(orderData || []);
    } catch (error) {
      console.error("Error loading order data:", error);
      setError("Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter orders based on selected time period
   */
  const filteredOrders = useMemo(() => {
    if (timePeriod === "all") return orders;

    const now = new Date();
    const cutoffDate = new Date();
    
    if (timePeriod === "7days") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timePeriod === "30days") {
      cutoffDate.setDate(now.getDate() - 30);
    }

    return orders.filter(order => {
      const orderDate = new Date(order.timestamp || order.date);
      return orderDate >= cutoffDate;
    });
  }, [orders, timePeriod]);

  /**
   * Analyze sales data to calculate item performance
   * 
   * This function:
   * 1. Aggregates all items from all orders
   * 2. Calculates total quantity sold per item
   * 3. Calculates total revenue per item
   * 4. Calculates percentage contribution to overall sales
   * 5. Sorts by quantity to identify best and worst performers
   * 
   * @returns {Object} Object containing itemStats array and summary totals
   */
  const salesAnalysis = useMemo(() => {
    // Create a map to aggregate item sales
    const itemMap = new Map();
    let totalQuantity = 0;
    let totalRevenue = 0;

    // Process each order
    filteredOrders.forEach(order => {
      // Skip orders without items
      if (!order.items || !Array.isArray(order.items)) {
        return;
      }

      // Process each item in the order
      order.items.forEach(item => {
        const itemName = item.name || item.item || "Unknown Item";
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const itemRevenue = quantity * price;

        // Update totals
        totalQuantity += quantity;
        totalRevenue += itemRevenue;

        // Aggregate item statistics
        if (itemMap.has(itemName)) {
          const existing = itemMap.get(itemName);
          existing.quantity += quantity;
          existing.revenue += itemRevenue;
          existing.orderCount += 1;
        } else {
          itemMap.set(itemName, {
            name: itemName,
            quantity: quantity,
            revenue: itemRevenue,
            orderCount: 1,
            avgPrice: price,
          });
        }
      });
    });

    // Convert map to array and calculate percentages
    const itemStats = Array.from(itemMap.values()).map(item => ({
      ...item,
      quantityPercent: totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0,
      revenuePercent: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
      avgOrderQuantity: item.quantity / item.orderCount,
    }));

    // Sort by quantity sold (descending)
    itemStats.sort((a, b) => b.quantity - a.quantity);

    return {
      itemStats,
      totalQuantity,
      totalRevenue,
      totalOrders: filteredOrders.length,
      uniqueItems: itemStats.length,
    };
  }, [filteredOrders]);

  /**
   * Get top N best-selling items
   */
  const bestSellers = useMemo(() => {
    return salesAnalysis.itemStats.slice(0, 10);
  }, [salesAnalysis]);

  /**
   * Get bottom N least-selling items
   */
  const worstSellers = useMemo(() => {
    return salesAnalysis.itemStats.slice(-10).reverse();
  }, [salesAnalysis]);

  /**
   * Get rank color based on performance
   */
  const getRankColor = (rank, total) => {
    const percentile = (rank / total) * 100;
    if (percentile <= 10) return "success.main"; // Top 10%
    if (percentile <= 30) return "info.main"; // Top 30%
    if (percentile <= 70) return "warning.main"; // Middle
    return "error.main"; // Bottom 30%
  };

  /**
   * Format currency values
   */
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Analyzing sales data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <SectionTitle
        icon={BarChart3}
        title="Sales Analytics"
        subtitle="Identify best-selling and least-selling items to optimize your menu"
      />

      {/* Controls */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            label="Time Period"
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
            startIcon={<RefreshCw />}
          onClick={loadData}
        >
          Refresh Data
        </Button>

        <HintTooltip text="This page analyzes your sales history to show which items sell the most and which sell the least. Use this to optimize your menu and inventory ordering." />
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {salesAnalysis.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Items Sold
              </Typography>
              <Typography variant="h4">
                {salesAnalysis.totalQuantity}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                {formatCurrency(salesAnalysis.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Unique Items
              </Typography>
              <Typography variant="h4">
                {salesAnalysis.uniqueItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {salesAnalysis.itemStats.length === 0 ? (
        <Alert severity="info">
          No sales data available for the selected time period. Start recording orders to see analytics!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Best Sellers */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Trophy size={24} color="#4caf50" />
                  <Typography variant="h6">
                    Best Sellers
                  </Typography>
                  <Chip 
                    label={`Top ${Math.min(10, bestSellers.length)}`} 
                    color="success" 
                    size="small" 
                  />
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Qty Sold</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">% of Sales</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bestSellers.map((item, index) => (
                        <TableRow 
                          key={index}
                          sx={{
                            backgroundColor: index < 3 ? 'rgba(76, 175, 80, 0.05)' : 'transparent'
                          }}
                        >
                          <TableCell>
                            <Chip 
                              label={`#${index + 1}`}
                              size="small"
                              sx={{ 
                                backgroundColor: getRankColor(index + 1, salesAnalysis.uniqueItems),
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={index < 3 ? "bold" : "normal"}>
                              {item.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {item.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main">
                              {formatCurrency(item.revenue)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                              <Typography variant="body2">
                                {item.quantityPercent.toFixed(1)}%
                              </Typography>
                              <TrendingUp size={16} color="#4caf50" />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {bestSellers.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: "success.lighter", borderRadius: 1 }}>
                    <Typography variant="body2" color="success.dark">
                      <strong>Top Performer:</strong> {bestSellers[0].name} accounts for{" "}
                      {bestSellers[0].quantityPercent.toFixed(1)}% of all items sold and{" "}
                      {bestSellers[0].revenuePercent.toFixed(1)}% of revenue!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Worst Sellers */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <AlertCircle size={24} color="#ff9800" />
                  <Typography variant="h6">
                    Least Sellers
                  </Typography>
                  <Chip 
                    label={`Bottom ${Math.min(10, worstSellers.length)}`} 
                    color="warning" 
                    size="small" 
                  />
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Qty Sold</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">% of Sales</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {worstSellers.map((item, index) => {
                        const actualRank = salesAnalysis.uniqueItems - index;
                        return (
                          <TableRow 
                            key={index}
                            sx={{
                              backgroundColor: index < 3 ? 'rgba(244, 67, 54, 0.05)' : 'transparent'
                            }}
                          >
                            <TableCell>
                              <Chip 
                                label={`#${actualRank}`}
                                size="small"
                                sx={{ 
                                  backgroundColor: getRankColor(actualRank, salesAnalysis.uniqueItems),
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={index < 3 ? "bold" : "normal"}>
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {item.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="warning.main">
                                {formatCurrency(item.revenue)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                                <Typography variant="body2">
                                  {item.quantityPercent.toFixed(1)}%
                                </Typography>
                                <TrendingDown size={16} color="#ff9800" />
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {worstSellers.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: "warning.lighter", borderRadius: 1 }}>
                    <Typography variant="body2" color="warning.dark">
                      <strong>Slow Mover:</strong> {worstSellers[0].name} only accounts for{" "}
                      {worstSellers[0].quantityPercent.toFixed(2)}% of sales. Consider reviewing this item.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Insights */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Insights & Recommendations
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Stock More Best Sellers
                      </Typography>
                      <Typography variant="body2">
                        Your top 3 items account for{" "}
                        {bestSellers.slice(0, 3).reduce((sum, item) => sum + item.quantityPercent, 0).toFixed(1)}%
                        {" "}of all sales. Ensure these items are always well-stocked.
                      </Typography>
                    </Alert>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Review Slow-Moving Items
                      </Typography>
                      <Typography variant="body2">
                        Bottom {worstSellers.length} items contribute only{" "}
                        {worstSellers.reduce((sum, item) => sum + item.quantityPercent, 0).toFixed(1)}%
                        {" "}to sales. Consider menu optimization or promotion strategies.
                      </Typography>
                    </Alert>
                  </Grid>
                  
                  {salesAnalysis.uniqueItems > 0 && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="subtitle2" gutterBottom>
                          Sales Distribution
                        </Typography>
                        <Typography variant="body2">
                          You have {salesAnalysis.uniqueItems} unique items on your menu. 
                          The top 20% of items generate approximately{" "}
                          {bestSellers.slice(0, Math.ceil(salesAnalysis.uniqueItems * 0.2))
                            .reduce((sum, item) => sum + item.revenuePercent, 0).toFixed(1)}%
                          {" "}of your revenue (Pareto principle in action).
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
