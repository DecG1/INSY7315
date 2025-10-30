import React, { useState, useEffect, useMemo } from "react";
import { Box, Card, CardContent, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, Divider, Table, TableHead, TableRow, TableCell, TableBody, Chip, Grid, Alert } from "@mui/material";
import { DollarSign, Filter, Calculator, TrendingUp } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { priceList } from "./mockData.js";
import { currency } from "./helpers.js";
import { listRecipes } from "./recipesService.js";
import { listInventory } from "./inventoryService.js";
import HintTooltip from "./HintTooltip.jsx";

const PricingPage = () => {
  // Legacy pricing state (for mock ingredient price updates)
  const [sel, setSel] = useState(priceList[0]?.name || "Fresh Tomatoes (per kg)");
  const [newPrice, setNewPrice] = useState(28.5);
  const [history, setHistory] = useState([
    { name: "Italian Sausage", from: 80, to: 85, date: "2024-07-21" },
  ]);

  // Dynamic pricing calculator state
  const [recipes, setRecipes] = useState([]); // All recipes from database
  const [inventory, setInventory] = useState([]); // All inventory items for ingredient pricing
  const [selectedRecipe, setSelectedRecipe] = useState(""); // Currently selected recipe for pricing
  const [markupFactor, setMarkupFactor] = useState(2.5); // Markup multiplier (default 2.5x = 150% markup)
  const [customSellPrice, setCustomSellPrice] = useState(""); // User can override suggested price

  /**
   * Load recipes and inventory on component mount
   * Recipes contain ingredient lists, inventory contains current ingredient costs
   */
  useEffect(() => {
    (async () => {
      const [r, inv] = await Promise.all([
        listRecipes(),
        listInventory(),
      ]);
      setRecipes(r);
      setInventory(inv);
      // Set first recipe as default selection
      if (r.length > 0 && !selectedRecipe) {
        setSelectedRecipe(r[0].name);
      }
    })();
  }, []);

  /**
   * Calculate total ingredient cost for the selected recipe
   * Matches recipe ingredients with inventory items to get current prices
   * Uses price-per-unit (ppu) from inventory for accurate costing
   * 
   * @returns {number} Total cost of all ingredients in the recipe
   */
  const calculateIngredientCost = useMemo(() => {
    const recipe = recipes.find(r => r.name === selectedRecipe);
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
      return 0;
    }

    let totalCost = 0;

    // Loop through each ingredient in the recipe
    for (const ingredient of recipe.ingredients) {
      // Find matching inventory item by name
      const inventoryItem = inventory.find(
        inv => inv.name.toLowerCase() === ingredient.name.toLowerCase()
      );

      if (inventoryItem) {
        // Use price-per-unit (ppu) from inventory
        // ppu is already normalized to base unit (g/ml/ea)
        const pricePerUnit = Number(inventoryItem.ppu || 0);
        const quantity = Number(ingredient.qty || 0);
        
        // Calculate cost: quantity × price per unit
        totalCost += quantity * pricePerUnit;
      } else {
        // If ingredient not found in inventory, log warning but continue
        console.warn(`Ingredient "${ingredient.name}" not found in inventory for recipe "${selectedRecipe}"`);
      }
    }

    return totalCost;
  }, [selectedRecipe, recipes, inventory]);

  /**
   * Calculate suggested selling price based on ingredient cost and markup factor
   * Formula: Selling Price = Ingredient Cost × Markup Factor
   * Example: R10 cost × 2.5 markup = R25 selling price
   * 
   * @returns {number} Suggested selling price
   */
  const suggestedPrice = useMemo(() => {
    return calculateIngredientCost * markupFactor;
  }, [calculateIngredientCost, markupFactor]);

  /**
   * Get the final selling price (custom if set, otherwise suggested)
   * Allows users to override the calculated price with their own
   * 
   * @returns {number} Final selling price to use
   */
  const finalSellPrice = useMemo(() => {
    if (customSellPrice && Number(customSellPrice) > 0) {
      return Number(customSellPrice);
    }
    return suggestedPrice;
  }, [customSellPrice, suggestedPrice]);

  /**
   * Calculate profit margin percentage
   * Formula: ((Selling Price - Cost) / Selling Price) × 100
   * Example: ((R25 - R10) / R25) × 100 = 60% profit margin
   * 
   * @returns {number} Profit margin as a percentage
   */
  const profitMargin = useMemo(() => {
    if (finalSellPrice === 0) return 0;
    return ((finalSellPrice - calculateIngredientCost) / finalSellPrice) * 100;
  }, [finalSellPrice, calculateIngredientCost]);

  /**
   * Calculate markup percentage
   * Formula: ((Selling Price - Cost) / Cost) × 100
   * Example: ((R25 - R10) / R10) × 100 = 150% markup
   * 
   * @returns {number} Markup percentage
   */
  const markupPercentage = useMemo(() => {
    if (calculateIngredientCost === 0) return 0;
    return ((finalSellPrice - calculateIngredientCost) / calculateIngredientCost) * 100;
  }, [finalSellPrice, calculateIngredientCost]);

  /**
   * Legacy function: Update mock ingredient price
   * Adds entry to price history log
   */
  const updatePrice = () => {
    setHistory((h) => [{ name: sel, from: 0, to: newPrice, date: new Date().toISOString().slice(0, 10) }, ...h]);
  };

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
      {/* Dynamic Pricing Calculator - NEW SECTION */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 6px 30px rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionTitle icon={Calculator} title="Dynamic Pricing Calculator" />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Calculate optimal selling prices based on ingredient costs and your desired profit margin
          </Typography>

          <Grid container spacing={3}>
            {/* Left Column: Input Controls */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Recipe Selection */}
                <FormControl fullWidth>
                  <InputLabel>Select Recipe/Product</InputLabel>
                  <Select
                    label="Select Recipe/Product"
                    value={selectedRecipe}
                    onChange={(e) => {
                      setSelectedRecipe(e.target.value);
                      setCustomSellPrice(""); // Reset custom price when changing recipe
                    }}
                  >
                    {recipes.map((r) => (
                      <MenuItem key={r.id || r.name} value={r.name}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Markup Factor Input */}
                <HintTooltip title="Markup factor multiplies your cost to suggest a selling price. For example, 2.5 means the selling price is 2.5× the cost (150% markup)">
                  <TextField
                    label="Markup Factor"
                    type="number"
                    value={markupFactor}
                    onChange={(e) => setMarkupFactor(Number(e.target.value) || 1)}
                    inputProps={{ min: 1, step: 0.1 }}
                    helperText="Multiply ingredient cost by this factor (e.g., 2.5 = 150% markup)"
                  />
                </HintTooltip>

                {/* Custom Selling Price (Optional Override) */}
                <HintTooltip title="Override the suggested price with your own custom selling price">
                  <TextField
                    label="Custom Selling Price (Optional)"
                    type="number"
                    value={customSellPrice}
                    onChange={(e) => setCustomSellPrice(e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    placeholder={`Suggested: ${currency(suggestedPrice)}`}
                    helperText="Leave blank to use suggested price"
                  />
                </HintTooltip>
              </Box>
            </Grid>

            {/* Right Column: Pricing Breakdown */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  bgcolor: 'rgba(139, 0, 0, 0.04)',
                  border: '2px solid rgba(139, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={20} />
                  Pricing Breakdown
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Total Ingredient Cost */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Ingredient Cost:
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {currency(calculateIngredientCost)}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Suggested Selling Price */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Suggested Selling Price:
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>
                      {currency(suggestedPrice)}
                    </Typography>
                  </Box>

                  {/* Final Selling Price (if custom is set) */}
                  {customSellPrice && Number(customSellPrice) > 0 && (
                    <>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Your Custom Price:
                        </Typography>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#8b0000' }}>
                          {currency(finalSellPrice)}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Divider />

                  {/* Profit Amount */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Profit per Item:
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'success.main' }}>
                      {currency(finalSellPrice - calculateIngredientCost)}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Profit Margin Percentage */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      bgcolor: profitMargin >= 50 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      PROFIT MARGIN
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: profitMargin >= 50 ? 'success.main' : 'warning.main' }}>
                      {profitMargin.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Markup: {markupPercentage.toFixed(0)}%
                    </Typography>
                  </Box>
                </Box>

                {/* Pricing Guidance Alert */}
                {profitMargin < 30 && calculateIngredientCost > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Low profit margin! Consider increasing markup factor or selling price.
                  </Alert>
                )}
                {profitMargin >= 60 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Excellent profit margin! Your pricing is healthy.
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Recipe Ingredient Details */}
          {selectedRecipe && recipes.find(r => r.name === selectedRecipe)?.ingredients && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Ingredient Breakdown for "{selectedRecipe}"
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ingredient</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipes.find(r => r.name === selectedRecipe)?.ingredients.map((ing, idx) => {
                    const inventoryItem = inventory.find(
                      inv => inv.name.toLowerCase() === ing.name.toLowerCase()
                    );
                    const pricePerUnit = inventoryItem ? Number(inventoryItem.ppu || 0) : 0;
                    const qty = Number(ing.qty || 0);
                    const cost = qty * pricePerUnit;

                    return (
                      <TableRow key={idx}>
                        <TableCell>{ing.name}</TableCell>
                        <TableCell>{qty} {ing.unit || inventoryItem?.unitBase || ''}</TableCell>
                        <TableCell>{currency(pricePerUnit)}/unit</TableCell>
                        <TableCell fontWeight={600}>{currency(cost)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="subtitle2" fontWeight={700}>
                        TOTAL COST:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'primary.main' }}>
                        {currency(calculateIngredientCost)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Legacy sections below (ingredient price list and manual updates) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 4,
        }}
      >
        <Card
          sx={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <SectionTitle icon={DollarSign} title="Price List" />
            <Box className="flex items-center gap-2 mb-2">
              <TextField size="small" placeholder="Search ingredient" />
              <Button variant="outlined" startIcon={<Filter size={16} />}>Filter</Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ingredient Name</TableCell>
                  <TableCell>Current Price</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {priceList.map((p) => (
                  <TableRow key={p.name} hover>
                    <TableCell>{p.name}</TableCell>
                    <TableCell><Chip color="success" label={currency(p.price)} /></TableCell>
                    <TableCell>{p.updated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <SectionTitle title="Update Ingredient Price" />
            <FormControl fullWidth>
              <InputLabel>Ingredient</InputLabel>
              <Select label="Ingredient" value={sel} onChange={(e) => setSel(e.target.value)}>
                {priceList.map((p) => <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="New Price" type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} />
            <Button variant="contained" color="error" onClick={updatePrice}>Update Price</Button>

            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Price History Log</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Change</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell>{h.name}</TableCell>
                    <TableCell>{currency(h.from)} → {currency(h.to)}</TableCell>
                    <TableCell>{h.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PricingPage;
