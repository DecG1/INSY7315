// PricingPage: Calculate product prices from ingredient costs.
// Purpose: Combine inventory ppu (base-unit price) with recipe ingredient
// quantities to compute total cost, then apply markup. Supports global and
// per-recipe markup overrides, and logs pricing decisions for audit.
import React, { useState, useEffect, useMemo } from "react";
import { Box, Card, CardContent, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, Divider, Table, TableHead, TableRow, TableCell, TableBody, Chip, Grid, Alert } from "@mui/material";
import { DollarSign, Filter, Calculator, TrendingUp } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { currency } from "./helpers.js";
import { listRecipes } from "./recipesService.js";
import { listInventory, updateInventory } from "./inventoryService.js";
import { toBaseQty } from "./units.js";
import HintTooltip from "./HintTooltip.jsx";
import { logPricingChanged } from "./auditService.js";

const PricingPage = () => {
  // --- Ingredient price update controls (bound to live inventory ppu) ---
  // Ingredient price update state (now tied to inventory)
  const [sel, setSel] = useState(""); // selected inventory item name
  const [newPrice, setNewPrice] = useState(0); // new price per base unit (ppu)
  const [history, setHistory] = useState([
    // Example entry; new entries get appended on price updates
  ]);

  // --- Dynamic pricing calculator state ---
  const [recipes, setRecipes] = useState([]); // All recipes from database
  const [inventory, setInventory] = useState([]); // All inventory items for ingredient pricing
  const [selectedRecipe, setSelectedRecipe] = useState(""); // Currently selected recipe for pricing
  const [markupFactor, setMarkupFactor] = useState(2.5); // Markup multiplier (default 2.5x = 150% markup)
  const [customSellPrice, setCustomSellPrice] = useState(""); // User can override suggested price
  const [recipeMarkupOverrides, setRecipeMarkupOverrides] = useState({}); // Per-recipe markup overrides { [recipeName]: number }

  /**
   * Load recipes and inventory on component mount
   * Recipes contain ingredient lists, inventory contains current ingredient costs
   */
  // Load recipes and inventory once; prefer ID-based linking for ingredients
  useEffect(() => {
    (async () => {
      const [r, inv] = await Promise.all([
        listRecipes(),
        listInventory(),
      ]);
      setRecipes(r);
      setInventory(inv);
      // Set defaults for price update controls
      if (inv.length > 0) {
        setSel(inv[0].name);
        setNewPrice(Number(inv[0].ppu || 0));
      }
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
  // Compute total cost of selected recipe (sum over ingredients: qtyBase × ppu)
  const calculateIngredientCost = useMemo(() => {
    const recipe = recipes.find(r => r.name === selectedRecipe);
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
      return 0;
    }

    let totalCost = 0;

    // Loop through each ingredient in the recipe
    for (const ingredient of recipe.ingredients) {
      // Find matching inventory item by ID (preferred) or fall back to name matching
      const inventoryItem = ingredient.invId
        ? inventory.find(inv => inv.id === ingredient.invId)
        : inventory.find(inv => inv.name.toLowerCase() === ingredient.name.toLowerCase());

      if (inventoryItem) {
        // Use price-per-unit (ppu) from inventory; normalized to base unit (g/ml/ea)
        const pricePerUnit = Number(inventoryItem.ppu || 0);
        const qtyBase = toBaseQty(Number(ingredient.qty || 0), ingredient.unit || inventoryItem.unitBase);
        
        // Calculate cost in base units: qtyBase × ppu
        totalCost += qtyBase * pricePerUnit;
      } else {
        // If ingredient not found in inventory, log warning but continue
        const identifier = ingredient.invId ? `ID ${ingredient.invId}` : `name "${ingredient.name}"`;
        console.warn(`Ingredient ${identifier} not found in inventory for recipe "${selectedRecipe}"`);
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
  // Suggested price = cost × markup (uses per-recipe override if present)
  const suggestedPrice = useMemo(() => {
    // Determine which markup to use: per-recipe override or global
    const override = recipeMarkupOverrides[selectedRecipe];
    const effectiveMarkup = override && Number(override) > 0 ? Number(override) : markupFactor;
    return calculateIngredientCost * effectiveMarkup;
  }, [calculateIngredientCost, markupFactor, recipeMarkupOverrides, selectedRecipe]);

  /**
   * Get the final selling price (custom if set, otherwise suggested)
   * Allows users to override the calculated price with their own
   * 
   * @returns {number} Final selling price to use
   */
  // Final sell price: custom override if provided, else suggested
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
  // Profit margin (%) = (price - cost) / price
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
  // Markup (%) = (price - cost) / cost
  const markupPercentage = useMemo(() => {
    if (calculateIngredientCost === 0) return 0;
    return ((finalSellPrice - calculateIngredientCost) / calculateIngredientCost) * 100;
  }, [finalSellPrice, calculateIngredientCost]);

  /**
   * Legacy function: Update mock ingredient price
   * Adds entry to price history log
   */
  const updatePrice = async () => {
    try {
      const item = inventory.find(i => i.name === sel);
      if (!item) {
        alert('Please select a valid inventory item');
        return;
      }
      const oldPrice = Number(item.ppu || 0); // old ppu
      const qty = Number(item.qty || 0);
      const unit = item.unit; // original unit key
      // Compute new total batch cost that yields the desired ppu
      const factor = unit === 'kg' ? 1000 : unit === 'l' ? 1000 : 1; // toBase factor; avoid importing CONV here
      const denom = (qty * factor) || 1;
      const newCost = Number(newPrice || 0) * denom;
      await updateInventory(item.id, { cost: newCost });

      // Refresh inventory list to reflect new ppu
      const inv = await listInventory();
      setInventory(inv);

      // Update history log (local UI)
      setHistory((h) => [{ name: item.name, from: oldPrice, to: Number(newPrice || 0), date: new Date().toISOString().slice(0, 10) }, ...h]);

      // Log pricing change to audit trail
      await logPricingChanged(item.name, oldPrice, Number(newPrice || 0));
    } catch (e) {
      console.error('Failed to update price', e);
      alert('Failed to update price');
    }
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

                {/* Per-Recipe Markup Override */}
                <HintTooltip title="Override the global markup for just this recipe. Leave blank to use the global markup.">
                  <TextField
                    label="Per-Recipe Markup Override (Optional)"
                    type="number"
                    value={recipeMarkupOverrides[selectedRecipe] ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRecipeMarkupOverrides((prev) => {
                        const next = { ...prev };
                        if (val === "" || Number(val) <= 0) {
                          delete next[selectedRecipe];
                        } else {
                          next[selectedRecipe] = Number(val);
                        }
                        return next;
                      });
                    }}
                    inputProps={{ min: 1, step: 0.1 }}
                    placeholder={`Using global: ${markupFactor.toFixed(2)}×`}
                    helperText={`Leave blank to use global markup (${markupFactor.toFixed(2)}×)`}
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

                  {/* Markup Source Indicator */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Using Markup:
                    </Typography>
                    <Chip
                      size="small"
                      color={recipeMarkupOverrides[selectedRecipe] ? 'secondary' : 'default'}
                      label={`${(recipeMarkupOverrides[selectedRecipe] ?? markupFactor).toFixed(2)}× ${recipeMarkupOverrides[selectedRecipe] ? '(Override)' : '(Global)'}`}
                    />
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
                    // Use ID-based lookup (preferred), fallback to name
                    const inventoryItem = ing.invId
                      ? inventory.find(inv => inv.id === ing.invId)
                      : inventory.find(inv => inv.name.toLowerCase() === ing.name.toLowerCase());
                    const pricePerUnit = inventoryItem ? Number(inventoryItem.ppu || 0) : 0;
                    const qtyBase = toBaseQty(Number(ing.qty || 0), ing.unit || inventoryItem?.unitBase);
                    const cost = qtyBase * pricePerUnit;
                    const unitLabel = inventoryItem?.unitBase || (ing.unit ? (['kg','g'].includes(ing.unit) ? 'g' : ['l','ml'].includes(ing.unit) ? 'ml' : 'ea') : 'unit');

                    return (
                      <TableRow key={idx}>
                        <TableCell>{ing.name}</TableCell>
                        <TableCell>{Number(ing.qty || 0)} {ing.unit || inventoryItem?.unitBase || ''}</TableCell>
                        <TableCell>{currency(pricePerUnit)}/{unitLabel}</TableCell>
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <HintTooltip title="Log this pricing decision to the audit trail (name, cost, price, margin)">
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        await logPricingChanged(
                          selectedRecipe,
                          calculateIngredientCost,
                          finalSellPrice,
                          'recipe'
                        );
                        alert('Pricing decision logged');
                      } catch (e) {
                        console.error('Failed to log pricing change', e);
                        alert('Failed to log pricing change');
                      }
                    }}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                  >
                    Log Pricing Decision
                  </Button>
                </HintTooltip>
              </Box>
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
            <SectionTitle icon={DollarSign} title="Ingredient Price List (from Inventory)" />
            <Box className="flex items-center gap-2 mb-2">
              <TextField size="small" placeholder="Search ingredient" />
              <Button variant="outlined" startIcon={<Filter size={16} />}>Filter</Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ingredient Name</TableCell>
                  <TableCell>Current Price (per base unit)</TableCell>
                  <TableCell>Base Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((it) => (
                  <TableRow key={it.id || it.name} hover>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>
                      <Chip color="success" label={`${currency(Number(it.ppu || 0))}/${it.unitBase || 'unit'}`} />
                    </TableCell>
                    <TableCell>{it.unitBase || '-'}</TableCell>
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
            <SectionTitle title="Update Ingredient Price (per base unit)" />
            <FormControl fullWidth>
              <InputLabel>Ingredient</InputLabel>
              <Select label="Ingredient" value={sel} onChange={(e) => {
                const name = e.target.value;
                setSel(name);
                const item = inventory.find(i => i.name === name);
                setNewPrice(item ? Number(item.ppu || 0) : 0);
              }}>
                {inventory.map((it) => <MenuItem key={it.id || it.name} value={it.name}>{it.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="New Price per Base Unit" type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} helperText="This adjusts the item's total cost to match the new per-base-unit price (ppu)" />
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
