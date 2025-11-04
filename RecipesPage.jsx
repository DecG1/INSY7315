// RecipesPage.jsx
// RecipesPage: Create, view, edit, duplicate, delete, and cook recipes.
// Purpose: Recipes link ingredients to inventory via invId (preferred) so
// costs and deductions are accurate even if names change. Cost estimation
// multiplies each ingredient's base-unit qty by the inventory ppu.
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Typography,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { ChefHat, PlusCircle, Eye, Pencil, Trash2, X, UtensilsCrossed, Copy } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";
import { currency } from "./helpers.js";
import HintTooltip from "./HintTooltip.jsx";

import { listRecipes, addRecipe, deleteRecipe, updateRecipe } from "./recipesService.js";
import { listInventory } from "./inventoryService.js";
import { cookRecipe } from "./kitchenService.js";
import { toBaseQty } from "./units.js";
import { logRecipeCreated, logRecipeDeleted } from "./auditService.js";

// ---- simple unit conversion helpers (kept local to this file for UX hints) ----
const normalizeUnit = (u = "") => u.toLowerCase();
const CONV = { g: 1, kg: 1000, ml: 1, l: 1000, ea: 1 };
const MASS = ["g", "kg"];
const VOL = ["ml", "l"];
const EACH = ["ea"];
const sameFamily = (a, b) => {
  const A = normalizeUnit(a), B = normalizeUnit(b);
  return (
    (MASS.includes(A) && MASS.includes(B)) ||
    (VOL.includes(A) && VOL.includes(B)) ||
    (EACH.includes(A) && EACH.includes(B))
  );
};
function convertToSameBase(qty, unit, targetUnit) {
  const u = normalizeUnit(unit);
  const t = normalizeUnit(targetUnit);
  if (!sameFamily(u, t)) return NaN;
  const base = (CONV[u] ?? 1) * Number(qty || 0);
  return base / (CONV[t] ?? 1);
}

export default function RecipesPage() {
  // DB data
  const [rows, setRows] = useState([]);
  const [inventory, setInventory] = useState([]);

  // form state
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    type: "Main Course",
    instructions: "",
    // ingredients: [{ invId, name, unit, qty }]
    ingredients: [],
  });
  const [estCost, setEstCost] = useState(0);

  // cook settings
  const [servings, setServings] = useState("");

  // view/edit dialogs state
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editRecipe, setEditRecipe] = useState({ id: null, name: "", type: "Main Course", instructions: "" });
  
  // Helper: compute recipe cost using inventory ppu (base-unit price)
  const computeRecipeCost = (ingredients = []) => {
    return ingredients.reduce((sum, ing) => {
      const inv = inventory.find(i => i.id === (ing.invId ?? ing.id));
      const ppu = Number(inv?.ppu ?? NaN);
      const qtyBase = toBaseQty(ing.qty ?? ing.quantity ?? 0, ing.unit);
      if (!isFinite(ppu) || !isFinite(qtyBase)) return sum;
      return sum + ppu * qtyBase;
    }, 0);
  };

  async function handleDuplicate(recipe) {
    try {
      const copy = {
        name: `${recipe.name} (Copy)`,
        type: recipe.type,
        instructions: recipe.instructions,
        ingredients: recipe.ingredients || [],
      };
      const computed = computeRecipeCost(copy.ingredients);
      copy.cost = Number(computed.toFixed(2));
      await addRecipe(copy);
      setRows(await listRecipes());
    } catch (e) {
      console.error('Failed to duplicate recipe', e);
      alert('Failed to duplicate recipe. See console for details.');
    }
  }

  // initial load
  useEffect(() => {
    (async () => {
      const [r, inv] = await Promise.all([listRecipes(), listInventory()]);
      setRows(r);
      setInventory(inv);
    })();
  }, []);

  // Autocomplete options from inventory
  const invOptions = useMemo(
    () =>
      inventory.map((i) => ({
        label: i.name,
        id: i.id,
        unit: i.unit,
        cost: Number(i.cost) || 0,
      })),
    [inventory]
  );

  // Cost calculator: sum ingredients by converting to base units (g/ml/ea)
  const calculateCost = () => {
  const total = newRecipe.ingredients.reduce((sum, ing) => {
    const inv = inventory.find(i => i.id === ing.invId);
    if (!inv) return sum;
    const needBase = toBaseQty(ing.qty, ing.unit);   // e.g., 1 kg -> 1000 g
    const ppu = Number(inv.ppu ?? NaN);              // price per base unit (g/ml/ea)
    if (!isFinite(needBase) || !isFinite(ppu)) return sum;
    return sum + needBase * ppu;
  }, 0);
  setEstCost(Number(total.toFixed(2)));
};

  // ingredient row helpers
  const addIngredientRow = () => {
    setNewRecipe((r) => ({
      ...r,
      ingredients: [...r.ingredients, { invId: null, name: "", unit: "g", qty: 0 }],
    }));
  };
  const removeIngredientRow = (idx) => {
    setNewRecipe((r) => ({
      ...r,
      ingredients: r.ingredients.filter((_, i) => i !== idx),
    }));
  };
  const setIngredientField = (idx, patch) => {
    setNewRecipe((r) => ({
      ...r,
      ingredients: r.ingredients.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    }));
  };

  async function handleSaveRecipe() {
    try {
      // Compute cost on save to ensure it's up to date, even if the user didn't click Calculate
      const computed = computeRecipeCost(newRecipe.ingredients || []);
      const costFixed = Number(computed.toFixed(2));

      const payload = { ...newRecipe, cost: costFixed };
      const id = await addRecipe(payload); // returns new id

      // Log recipe creation with full context (include id)
      await logRecipeCreated({ ...payload, id });

      // Refresh list and reset form
      setRows(await listRecipes());
      setNewRecipe({ name: "", type: "Main Course", instructions: "", ingredients: [] });
      setEstCost(0);

      alert("Recipe saved successfully.");
    } catch (e) {
      console.error("Failed to save recipe", e);
      alert("Failed to save recipe. Please check ingredients and try again.");
    }
  }

  async function handleDeleteRecipe(id) {
    const recipe = rows.find(r => r.id === id);
    const name = recipe?.name || "this recipe";
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    await deleteRecipe(id);
    
    // Log recipe deletion to audit trail
    if (recipe) {
      await logRecipeDeleted(
        recipe.name,
        recipe.type,
        recipe.ingredients?.length || 0
      );
    }
    
    setRows(await listRecipes());
  }

  async function handleCook(r) {
    const servingsNum = Math.max(1, Number(servings || 1));
    const res = await cookRecipe(r, { servings: servingsNum });
    if (!res.ok) {
      alert(
        "Not enough stock:\n" +
          res.shortages
            .map((s) =>
              s.needed
                ? `${s.name} (need ${s.needed}${s.unit}, have ${s.available}${s.unit})`
                : `${s.name} (${s.reason})`
            )
            .join("\n")
      );
    }
  }

  // ---- Actions: View / Edit ----
  function handleViewRecipe(recipe) {
    setSelectedRecipe(recipe);
    setViewOpen(true);
  }

  function handleEditClick(recipe) {
    setEditRecipe({ id: recipe.id, name: recipe.name || "", type: recipe.type || "Main Course", instructions: recipe.instructions || "" });
    setEditOpen(true);
  }

  async function handleEditSave() {
    try {
      const { id, name, type, instructions } = editRecipe;
      await updateRecipe(id, { name: name?.trim(), type, instructions });
      setEditOpen(false);
      setRows(await listRecipes());
    } catch (e) {
      console.error("Failed to update recipe", e);
      alert("Failed to update recipe. See console for details.");
    }
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 2,
        height: '100%',
        animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Recipe list table */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          height: 'fit-content',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionTitle icon={ChefHat} title="Recipe Overview" />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, mt: 2 }}>
            <TextField
              label="Servings to cook"
              type="number"
              size="small"
              value={servings}                
              onChange={(e) => setServings(e.target.value)}
              inputProps={{ min: 1 }}
              sx={{ 
                width: 180,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                }
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Choose servings, then click <em>Cook</em> on a recipe to deduct stock.
            </Typography>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Recipe Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dish Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estimated Cost</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow 
                  key={r.id ?? r.name} 
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{currency(r.cost ?? 0)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <HintTooltip hint="Cook this recipe and deduct ingredients from inventory">
                        <IconButton 
                          onClick={() => handleCook(r)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(139, 0, 0, 0.08)',
                            }
                          }}
                        >
                          <UtensilsCrossed size={16} />
                        </IconButton>
                      </HintTooltip>
                      <HintTooltip hint="View recipe details and cooking instructions">
                        <IconButton
                          onClick={() => handleViewRecipe(r)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(139, 0, 0, 0.08)',
                            }
                          }}
                        >
                          <Eye size={16} />
                        </IconButton>
                      </HintTooltip>
                      <HintTooltip hint="Edit recipe name, type, ingredients, or instructions">
                        <IconButton
                          onClick={() => handleEditClick(r)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(139, 0, 0, 0.08)',
                            }
                          }}
                        >
                          <Pencil size={16} />
                        </IconButton>
                      </HintTooltip>
                      <HintTooltip hint="Duplicate this recipe">
                        <IconButton
                          onClick={() => handleDuplicate(r)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(139, 0, 0, 0.08)',
                            }
                          }}
                        >
                          <Copy size={16} />
                        </IconButton>
                      </HintTooltip>
                      <HintTooltip hint="Permanently delete this recipe">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteRecipe(r.id)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </HintTooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Box sx={{ py: 3 }}>
                      <ChefHat size={40} color="#ccc" style={{ marginBottom: '8px' }} />
                      <Typography color="text.secondary" fontWeight={600}>
                        No recipes yet.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create your first recipe using the form on the right.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* View Recipe Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Recipe Details</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedRecipe ? (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>{selectedRecipe.name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedRecipe.type}</Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary">
                Estimated Cost: {currency(selectedRecipe.cost ?? 0)}
              </Typography>
              <Divider />
              <Typography variant="subtitle2" fontWeight={700}>Ingredients</Typography>
              <Box sx={{ display: 'grid', gap: 1.25 }}>
                {(selectedRecipe.ingredients || []).map((ing, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <Typography>{ing.name}</Typography>
                    <Typography color="text.secondary">
                      {(ing.qty ?? ing.quantity ?? 0)} {ing.unit}
                    </Typography>
                  </Box>
                ))}
                {(!selectedRecipe.ingredients || selectedRecipe.ingredients.length === 0) && (
                  <Typography variant="body2" color="text.secondary">No ingredients listed.</Typography>
                )}
              </Box>
              <Divider />
              <Typography variant="subtitle2" fontWeight={700}>Instructions</Typography>
              <Box sx={{
                p: 2,
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '10px',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }}>
                <Typography whiteSpace="pre-wrap" fontSize={14}>
                  {selectedRecipe.instructions || '—'}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setViewOpen(false)} sx={{ borderRadius: '10px', textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Recipe Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Recipe</DialogTitle>
        <DialogContent dividers sx={{ p: 3, display: 'grid', gap: 2 }}>
          <TextField
            label="Recipe Name"
            fullWidth
            value={editRecipe.name}
            onChange={(e) => setEditRecipe((r) => ({ ...r, name: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <FormControl fullWidth>
            <InputLabel>Dish Type</InputLabel>
            <Select
              label="Dish Type"
              value={editRecipe.type}
              onChange={(e) => setEditRecipe((r) => ({ ...r, type: e.target.value }))}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="Main Course">Main Course</MenuItem>
              <MenuItem value="Starter">Starter</MenuItem>
              <MenuItem value="Dessert">Dessert</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Cooking Instructions"
            fullWidth
            multiline
            minRows={4}
            value={editRecipe.instructions}
            onChange={(e) => setEditRecipe((r) => ({ ...r, instructions: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <Typography variant="caption" color="text.secondary">
            Ingredient editing will be added soon. For now, adjust name, type, and instructions.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ borderRadius: '10px', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleEditSave}
            sx={{ borderRadius: '10px', textTransform: 'none', boxShadow: '0 2px 8px rgba(139, 0, 0, 0.2)' }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add new recipe form */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          height: 'fit-content',
        }}
      >
        <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <SectionTitle title="Add New Recipe" />
          <TextField
            label="Recipe Name"
            fullWidth
            value={newRecipe.name}
            onChange={(e) => setNewRecipe((r) => ({ ...r, name: e.target.value }))}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
              }
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Dish Type</InputLabel>
            <Select
              label="Dish Type"
              value={newRecipe.type}
              onChange={(e) => setNewRecipe((r) => ({ ...r, type: e.target.value }))}
              sx={{
                borderRadius: '10px',
              }}
            >
              <MenuItem value="Main Course">Main Course</MenuItem>
              <MenuItem value="Starter">Starter</MenuItem>
              <MenuItem value="Dessert">Dessert</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Cooking Instructions"
            multiline
            minRows={4}
            fullWidth
            value={newRecipe.instructions}
            onChange={(e) => setNewRecipe((r) => ({ ...r, instructions: e.target.value }))}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
              }
            }}
          />

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Ingredients (from Inventory)
          </Typography>

          {newRecipe.ingredients.map((ing, idx) => {
            const selected = ing.invId ? invOptions.find((o) => o.id === ing.invId) : null;
            // Show a tiny hint if units are incompatible
            let unitHint = "";
            if (selected && !sameFamily(ing.unit, selected.unit)) {
              unitHint = `Note: ${selected.label} is stored in ${selected.unit}.`;
            }
            return (
              <Box
                key={idx}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "6fr 3fr 2fr auto",
                  gap: 2,
                  alignItems: "center",
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                }}
              >
                {/* Autocomplete binds ingredient to an inventory item by ID */}
                <Autocomplete
                  options={invOptions}
                  value={selected || null}
                  onChange={(_, val) => {
                    if (val) {
                      setIngredientField(idx, {
                        invId: val.id,
                        name: val.label,
                        unit: val.unit, // lock to inventory unit by default
                      });
                    } else {
                      setIngredientField(idx, { invId: null, name: "", unit: "g" });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Ingredient (from inventory)"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                        }
                      }}
                    />
                  )}
                  disableClearable={false}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={ing.qty === 0 ? "" : ing.qty}                
                  onChange={(e) => {
                    const v = e.target.value;
                    setIngredientField(idx, { qty: v === "" ? 0 : Number(v) });
                  }}
                  inputProps={{ min: 0 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    }
                  }}
                />

                {/* Unit is typically fixed to the inventory unit when invId is selected */}
                <FormControl>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    label="Unit"
                    value={ing.unit}
                    onChange={(e) => setIngredientField(idx, { unit: e.target.value })}
                    disabled={Boolean(ing.invId)}
                    sx={{
                      borderRadius: '10px',
                    }}
                  >
                    {["g", "kg", "ml", "l", "ea"].map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <HintTooltip hint="Remove this ingredient from the recipe">
                  <IconButton 
                    color="error" 
                    onClick={() => removeIngredientRow(idx)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.08)',
                      }
                    }}
                  >
                    <X size={18} />
                  </IconButton>
                </HintTooltip>
                {unitHint && (
                  <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1", mt: 1 }}>
                    {unitHint}
                  </Typography>
                )}
              </Box>
            );
          })}

          <HintTooltip hint="Add another ingredient to this recipe">
            <Button 
              startIcon={<PlusCircle size={16} />} 
              onClick={addIngredientRow}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Add Ingredient
            </Button>
          </HintTooltip>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
            <HintTooltip hint="Calculate the total cost of all ingredients in this recipe based on current inventory prices">
              <Button 
                variant="contained" 
                color="success" 
                onClick={calculateCost}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
                }}
              >
                Calculate Cost
              </Button>
            </HintTooltip>
            <Typography variant="subtitle2" fontWeight={700}>
              Estimated Cost: {currency(estCost)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <HintTooltip hint="Clear all ingredients and start over">
              <Button 
                variant="outlined" 
                onClick={() => setNewRecipe((r) => ({ ...r, ingredients: [] }))}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Clear
              </Button>
            </HintTooltip>
            <HintTooltip hint="Save this recipe to the database">
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleSaveRecipe}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(139, 0, 0, 0.2)',
                }}
              >
                Save Recipe
              </Button>
            </HintTooltip>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
