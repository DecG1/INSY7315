// RecipesPage.jsx
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
import Autocomplete from "@mui/material/Autocomplete";
import { ChefHat, PlusCircle, Eye, Pencil, Trash2, X, UtensilsCrossed } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";
import { currency } from "./helpers.js";

import { listRecipes, addRecipe, deleteRecipe } from "./recipesService.js";
import { listInventory } from "./inventoryService.js";
import { cookRecipe } from "./kitchenService.js";
import { toBaseQty } from "./units.js";

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

  // cost calculator: sum over ingredients by converting to inventory unit
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
    const payload = { ...newRecipe, cost: estCost };
    await addRecipe(payload);
    setRows(await listRecipes());
    // reset basic fields
    setNewRecipe({
      name: "",
      type: "Main Course",
      instructions: "",
      ingredients: [],
    });
    setEstCost(0);
  }

  async function handleDeleteRecipe(id) {
    await deleteRecipe(id);
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

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
        p: 3,
        animation: 'fadeIn 0.6s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Recipe list table */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <SectionTitle icon={ChefHat} title="Recipe Overview" />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TextField
                  label="Servings to cook"
                  type="number"
                  size="small"
                  value={servings}                
                  onChange={(e) => setServings(e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 180 }}
                  />
            <Typography variant="body2" color="text.secondary">
              Choose servings, then click <em>Cook</em> on a recipe to deduct stock.
            </Typography>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Recipe Name</TableCell>
                <TableCell>Dish Type</TableCell>
                <TableCell>Estimated Cost</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id ?? r.name} hover>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{currency(r.cost ?? 0)}</TableCell>
                  <TableCell align="right">
                    <IconButton title="Cook" onClick={() => handleCook(r)}>
                      <UtensilsCrossed size={16} />
                    </IconButton>
                    <IconButton title="View">
                      <Eye size={16} />
                    </IconButton>
                    <IconButton title="Edit">
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton title="Delete" color="error" onClick={() => handleDeleteRecipe(r.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No recipes yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add new recipe form */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <SectionTitle title="Add New Recipe" />
          <TextField
            label="Recipe Name"
          
            fullWidth
            value={newRecipe.name}
            onChange={(e) => setNewRecipe((r) => ({ ...r, name: e.target.value }))}
          />
          <FormControl fullWidth>
            <InputLabel>Dish Type</InputLabel>
            <Select
              label="Dish Type"
              value={newRecipe.type}
              onChange={(e) => setNewRecipe((r) => ({ ...r, type: e.target.value }))}
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
          />

          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>
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
                }}
              >
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
                  renderInput={(params) => <TextField {...params} label="Ingredient (from inventory)" />}
                  disableClearable={false}
                />
                <TextField
                 label="Quantity"
                 type="number"
                  value={ing.qty === 0 ? "" : ing.qty}                
                    onChange={(e) => {
                     const v = e.target.value;
                      setIngredientField(idx, { qty: v === "" ? 0 : Number(v) }); //0 isnt shown by default
                         }}
                            inputProps={{ min: 0 }}
                             />

                <FormControl>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    label="Unit"
                    value={ing.unit}
                    onChange={(e) => setIngredientField(idx, { unit: e.target.value })}
                    disabled={Boolean(ing.invId)} // lock to inventory unit; set false to allow conversions
                  >
                    {["g", "kg", "ml", "l", "ea"].map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton color="error" title="Remove" onClick={() => removeIngredientRow(idx)}>
                  <X size={18} />
                </IconButton>
                {unitHint && (
                  <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
                    {unitHint}
                  </Typography>
                )}
              </Box>
            );
          })}

          <Button startIcon={<PlusCircle size={16} />} onClick={addIngredientRow}>
            Add Ingredient
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button variant="contained" color="success" onClick={calculateCost}>
              Calculate Cost
            </Button>
            <Typography variant="subtitle2">Estimated Cost: {currency(estCost)}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="text" onClick={() => setNewRecipe((r) => ({ ...r, ingredients: [] }))}>
              Clear
            </Button>
            <Button variant="contained" color="error" onClick={handleSaveRecipe}>
              Save Recipe
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
