import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Button,
  TextField, IconButton, Grid, Divider, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { Receipt, Plus, Trash2, Save, ChefHat } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { currency } from "./helpers.js";
import { addSale } from "./analyticsService.js";
import HintTooltip from "./HintTooltip.jsx";
import { logOrderCreated } from "./auditService.js";
import { listRecipes } from "./recipesService.js";
import { cookRecipe } from "./kitchenService.js";
import { listInventory, updateInventory } from "./inventoryService.js";
import { toBaseQty } from "./units.js";
import { db } from "./db.js";
import { addNotificationIfEnabled } from "./settingsService.js";

const ScannerPage = () => {
  const [food, setFood] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [dessert, setDessert] = useState([]);
  const [other, setOther] = useState([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeQuantity, setRecipeQuantity] = useState("1");
  const [recipePriceMarkup, setRecipePriceMarkup] = useState("50"); // default 50% markup
  const [targetCategory, setTargetCategory] = useState("food");

  useEffect(() => {
    (async () => {
      const r = await listRecipes();
      setRecipes(r);
    })();
  }, []);

  const addItem = (category) => {
    const newItem = { id: Date.now(), name: "", price: "", quantity: "1" };
    switch (category) {
      case "food": setFood([...food, newItem]); break;
      case "drinks": setDrinks([...drinks, newItem]); break;
      case "dessert": setDessert([...dessert, newItem]); break;
      case "other": setOther([...other, newItem]); break;
    }
  };

  const openRecipeSelector = (category) => {
    setTargetCategory(category);
    setRecipeDialogOpen(true);
    setSelectedRecipe(recipes[0] || null);
    setRecipeQuantity("1");
    setRecipePriceMarkup("50");
  };

  const addRecipeToOrder = () => {
    if (!selectedRecipe) return;
    const qty = Number(recipeQuantity) || 1;
    const markup = Number(recipePriceMarkup) || 0;
    const costPerServing = Number(selectedRecipe.cost) || 0;
    const pricePerServing = costPerServing * (1 + markup / 100);
    
    // Add as a single line item with quantity
    const newItem = {
      id: Date.now(),
      name: selectedRecipe.name,
      price: pricePerServing.toFixed(2),
      quantity: qty.toString(),
      recipeId: selectedRecipe.id,
      servings: 1 // servings per unit
    };
    
    switch (targetCategory) {
      case "food": setFood(prev => [...prev, newItem]); break;
      case "drinks": setDrinks(prev => [...prev, newItem]); break;
      case "dessert": setDessert(prev => [...prev, newItem]); break;
      case "other": setOther(prev => [...prev, newItem]); break;
    }
    
    setRecipeDialogOpen(false);
  };

  const updateItem = (category, id, field, value) => {
    const updateFn = (items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    switch (category) {
      case "food": setFood(updateFn(food)); break;
      case "drinks": setDrinks(updateFn(drinks)); break;
      case "dessert": setDessert(updateFn(dessert)); break;
      case "other": setOther(updateFn(other)); break;
    }
  };

  const removeItem = (category, id) => {
    const filterFn = (items) => items.filter((item) => item.id !== id);
    switch (category) {
      case "food": setFood(filterFn(food)); break;
      case "drinks": setDrinks(filterFn(drinks)); break;
      case "dessert": setDessert(filterFn(dessert)); break;
      case "other": setOther(filterFn(other)); break;
    }
  };

  const calculateCategoryTotal = (items) =>
    items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + (price * qty);
    }, 0);

  const foodTotal = calculateCategoryTotal(food);
  const drinksTotal = calculateCategoryTotal(drinks);
  const dessertTotal = calculateCategoryTotal(dessert);
  const otherTotal = calculateCategoryTotal(other);
  const orderTotal = foodTotal + drinksTotal + dessertTotal + otherTotal;
  const paid = Number(amountPaid) || 0;
  const gratuity = paid - orderTotal;

  const clearDocket = () => {
    setFood([]);
    setDrinks([]);
    setDessert([]);
    setOther([]);
    setAmountPaid("");
  };

  const saveDocket = async () => {
    const docket = {
      food, drinks, dessert, other,
      orderTotal, amountPaid: paid, gratuity,
      timestamp: new Date().toISOString(),
    };

    const items = [...food, ...drinks, ...dessert, ...other]
      .filter((i) => i?.name)
      .map((i) => ({ 
        name: i.name, 
        price: Number(i.price) || 0, 
        quantity: Number(i.quantity) || 1 
      }));

    await addSale({ date: docket.timestamp, amount: orderTotal, cost: 0, items });

    try {
      await logOrderCreated({
        items: [...food, ...drinks, ...dessert, ...other].map((i) => ({
          name: i.name, price: Number(i.price) || 0,
        })),
        total: orderTotal, gratuity, amountPaid: paid,
      });
    } catch (e) {
      console.error("Failed to log order creation:", e);
    }

    // Deduct inventory for recipe-based items AND name-matched items
    const allItems = [...food, ...drinks, ...dessert, ...other];
    const failures = [];
    let deductionCount = 0;

    // Load inventory for name matching
    const inventory = await listInventory();

    for (const item of allItems) {
      if (!item.name) continue; // skip empty items
      
      const itemQty = Number(item.quantity) || 1;

      // Case 1: Item was added via Recipe button (has recipeId)
      if (item.recipeId) {
        const recipe = recipes.find(r => r.id === item.recipeId);
        if (recipe) {
          const totalServings = (item.servings || 1) * itemQty;
          const result = await cookRecipe(recipe, { servings: totalServings });
          if (!result.ok) {
            failures.push({
              name: `${recipe.name} (×${itemQty})`,
              type: 'recipe',
              shortages: result.shortages
            });
          } else {
            deductionCount++;
          }
        }
        continue;
      }

      // Case 2: Manual item - check if name matches a recipe
      const matchedRecipe = recipes.find(r => 
        r.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      );
      
      if (matchedRecipe) {
        const result = await cookRecipe(matchedRecipe, { servings: itemQty });
        if (!result.ok) {
          failures.push({
            name: `${matchedRecipe.name} (×${itemQty}, name-matched)`,
            type: 'recipe',
            shortages: result.shortages
          });
        } else {
          deductionCount++;
        }
        continue;
      }

      // Case 3: Manual item - check if name matches an inventory ingredient
      const matchedIngredient = inventory.find(inv => 
        inv.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      );

      if (matchedIngredient) {
        // Deduct itemQty units of the matched ingredient
        const currentQty = Number(matchedIngredient.qty || 0);
        const deductQty = itemQty; // deduct based on order quantity
        
        if (currentQty >= deductQty) {
          try {
            await updateInventory(matchedIngredient.id, { 
              qty: currentQty - deductQty 
            });
            deductionCount++;
            
            // Check if below reorder threshold
            const newQtyBase = toBaseQty(currentQty - deductQty, matchedIngredient.unit);
            const thresholdBase = Number(matchedIngredient.reorderBase || 0);
            
            if (thresholdBase > 0 && newQtyBase <= thresholdBase) {
              await addNotificationIfEnabled('lowStock', {
                tone: "error",
                msg: `Low stock: ${matchedIngredient.name} (${(currentQty - deductQty).toFixed(2)} ${matchedIngredient.unit})`,
                ago: "just now",
              });
            }
          } catch (e) {
            failures.push({
              name: `${matchedIngredient.name} (×${itemQty})`,
              type: 'ingredient (name-matched)',
              shortages: [{ reason: `Failed to deduct: ${e.message}` }]
            });
          }
        } else {
          failures.push({
            name: `${matchedIngredient.name} (×${itemQty})`,
            type: 'ingredient (name-matched)',
            shortages: [{
              name: matchedIngredient.name,
              needed: deductQty,
              available: currentQty,
              unit: matchedIngredient.unit
            }]
          });
        }
      }
    }

    // Show appropriate feedback
    if (failures.length > 0) {
      const msg = failures.map(f => 
        `${f.name} (${f.type}): ${f.shortages.map(s => 
          s.needed !== undefined
            ? `need ${s.needed}${s.unit}, have ${s.available}${s.unit}`
            : s.reason || 'insufficient stock'
        ).join(', ')}`
      ).join('\n\n');
      
      alert(`Order saved${deductionCount > 0 ? `, ${deductionCount} item(s) deducted` : ''}, but some deductions failed:\n\n${msg}\n\nPlease restock affected items.`);
    } else if (deductionCount > 0) {
      alert(`Order saved! Inventory deducted for ${deductionCount} item(s).`);
    } else {
      alert("Order saved and added to dashboard analytics.");
    }
    
    clearDocket();
  };

  const getCategoryStyle = (category) => {
    const styles = {
      food: { accent: "#8B0000", icon: "🍽️" },
      drinks: { accent: "#003366", icon: "🥂" },
      dessert: { accent: "#996515", icon: "🍰" },
      other: { accent: "#3E3E3E", icon: "📦" },
    };
    return styles[category] || styles.other;
  };

  const renderCategory = (title, items, category) => {
    const { accent, icon } = getCategoryStyle(category);
    const subtotal = calculateCategoryTotal(items);

    return (
      <Card
        sx={{
          borderRadius: "20px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          transition: "0.3s",
          "&:hover": { boxShadow: `0 8px 24px ${accent}25` },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                width: 46, height: 46, mr: 2,
                borderRadius: "12px",
                background: `${accent}10`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => addItem(category)}
              sx={{
                py: 1.2,
                borderRadius: "50px",
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}c0 100%)`,
                fontWeight: 600,
                "&:hover": { filter: "brightness(0.9)" },
              }}
            >
              Add Item
            </Button>
            <HintTooltip hint="Add a recipe with auto-pricing and inventory deduction">
              <Button
                variant="outlined"
                startIcon={<ChefHat size={18} />}
                onClick={() => openRecipeSelector(category)}
                disabled={recipes.length === 0}
                sx={{
                  py: 1.2,
                  borderRadius: "50px",
                  fontWeight: 600,
                  borderColor: accent,
                  color: accent,
                  "&:hover": { 
                    borderColor: accent,
                    backgroundColor: `${accent}10`,
                  },
                }}
              >
                Recipe
              </Button>
            </HintTooltip>
          </Box>

          {items.length === 0 ? (
            <Box
              sx={{
                py: 4, textAlign: "center",
                color: "text.secondary",
                border: "1.5px dashed rgba(0,0,0,0.15)",
                borderRadius: "12px",
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                No items yet — click Add Item
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {items.map((item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: "12px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: index % 2 === 0 ? "#fafafa" : "#fff",
                      "&:hover": { borderColor: `${accent}60` },
                    }}
                  >
                    <TextField
                      placeholder="Qty"
                      value={String(item.quantity ?? "1")}
                      onChange={(e) => {
                        // Keep only digits; allow temporary empty while typing
                        const digits = (e.target.value || "").replace(/[^0-9]/g, "");
                        updateItem(category, item.id, "quantity", digits);
                      }}
                      onBlur={(e) => {
                        const digits = (e.target.value || "").replace(/[^0-9]/g, "");
                        const n = Math.max(1, Number(digits || 1));
                        updateItem(category, item.id, "quantity", String(n));
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      size="small"
                      sx={{ width: 84, textAlign: 'center' }}
                    />
                    <TextField
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(category, item.id, "name", e.target.value)
                      }
                      fullWidth
                      size="small"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                    />
                    <TextField
                      placeholder="0.00"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(category, item.id, "price", e.target.value)
                      }
                      type="number"
                      size="small"
                      sx={{ width: 180 }}
                      InputProps={{
                        startAdornment: (
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: accent,
                              mr: 0.5,
                              fontSize: "0.9rem",
                            }}
                          >
                            R
                          </Typography>
                        ),
                      }}
                    />
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeItem(category, item.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Subtotal
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color={accent}>
                  {currency(subtotal)}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        p: 4,
        background: "linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%)",
        minHeight: "100vh",
        borderRadius: "20px",
      }}
    >
      <SectionTitle
        icon={Receipt}
        title="Order Entry"
        action={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={clearDocket}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              startIcon={<Save size={16} />}
              onClick={saveDocket}
              disabled={orderTotal === 0}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                background: "linear-gradient(135deg, #8B0000 0%, #B22222 100%)",
                color: "#fff",
                "&:hover": {
                  color: "#fff",
                  filter: "brightness(0.9)",
                },
              }}
            >
              Save Order
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>{renderCategory("Food", food, "food")}</Grid>
        <Grid item xs={12} md={6}>{renderCategory("Drinks", drinks, "drinks")}</Grid>
        <Grid item xs={12} md={6}>{renderCategory("Dessert", dessert, "dessert")}</Grid>
        <Grid item xs={12} md={6}>{renderCategory("Other", other, "other")}</Grid>
      </Grid>

      {/* Summary */}
      <Card
        sx={{
          mt: 4,
          borderRadius: "20px",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            Order Summary
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Order Total</Typography>
              <Typography fontWeight={700}>{currency(orderTotal)}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Amount Paid</Typography>
              <TextField
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                size="small"
                type="number"
                sx={{ width: 140 }}
                InputProps={{
                  startAdornment: (
                    <Typography
                      sx={{
                        mr: 0.5,
                        fontWeight: 700,
                        color: "#8B0000",
                      }}
                    >
                      R
                    </Typography>
                  ),
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: gratuity >= 0 ? "success.main" : "error.main",
              }}
            >
              <Typography fontWeight={700}>
                {gratuity >= 0 ? "Gratuity" : "Shortfall"}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {currency(Math.abs(gratuity))}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Recipe Selector Dialog */}
      <Dialog 
        open={recipeDialogOpen} 
        onClose={() => setRecipeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Recipe to Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Recipe</InputLabel>
              <Select
                value={selectedRecipe?.id || ''}
                label="Select Recipe"
                onChange={(e) => {
                  const recipe = recipes.find(r => r.id === e.target.value);
                  setSelectedRecipe(recipe);
                }}
              >
                {recipes.map(r => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name} ({r.type}) - Cost: {currency(r.cost || 0)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantity (Servings)"
              type="number"
              value={recipeQuantity}
              onChange={(e) => {
                const v = e.target.value;
                let n = parseInt(v, 10);
                if (!Number.isFinite(n) || n < 1) n = 1;
                setRecipeQuantity(String(n));
              }}
              inputProps={{ min: 1, step: 1 }}
              fullWidth
            />

            <TextField
              label="Price Markup (%)"
              type="number"
              value={recipePriceMarkup}
              onChange={(e) => setRecipePriceMarkup(e.target.value)}
              inputProps={{ min: 0 }}
              fullWidth
              helperText="Percentage added to cost to determine selling price"
            />

            {selectedRecipe && (
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'rgba(139, 0, 0, 0.05)',
                  border: '1px solid rgba(139, 0, 0, 0.2)'
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Price Calculation:
                </Typography>
                <Typography variant="body2">
                  Cost per serving: {currency(selectedRecipe.cost || 0)}
                </Typography>
                <Typography variant="body2">
                  Markup: {recipePriceMarkup}%
                </Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>
                  Selling price per serving: {currency(
                    ((selectedRecipe.cost || 0) * (1 + Number(recipePriceMarkup || 0) / 100)).toFixed(2)
                  )}
                </Typography>
                <Typography variant="body1" fontWeight={700} color="primary">
                  Total: {currency(
                    ((selectedRecipe.cost || 0) * (1 + Number(recipePriceMarkup || 0) / 100) * Number(recipeQuantity || 1)).toFixed(2)
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  ⚠️ Inventory will be deducted when order is saved
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecipeDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={addRecipeToOrder}
            disabled={!selectedRecipe}
          >
            Add to Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScannerPage;
