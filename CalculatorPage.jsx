import React, { useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Divider, Button, FormControl, InputLabel, Select, MenuItem, TextField, IconButton } from "@mui/material";
import { FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import HintTooltip from "./HintTooltip.jsx";
import { listRecipes } from "./recipesService.js";
import { listInventory } from "./inventoryService.js";
import { baseUnit, toBaseQty } from "./units.js";
import { currency } from "./helpers.js";

/**
 * CalculatorPage
 * Allows the user to select a recipe and enter a quantity to estimate total cost.
 * Note on quantity input: We intentionally keep the input value as a string so it can be empty
 * (no default 0 displayed). We only coerce to a number when performing calculations.
 */
const CalculatorPage = () => {
  const [recipeRows, setRecipeRows] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [sel, setSel] = useState("");
  // Quantity is stored as a string so the TextField can be truly empty (no auto 0).
  // This improves UX: users only see exactly what they type. Numeric coercion happens at compute time.
  const [qty, setQty] = useState("");
  // Ad-hoc ingredients included in the calculation
  const [ings, setIngs] = useState([]); // [{ invId, unit, qty }]

  React.useEffect(() => {
    (async () => {
      const [rows, inv] = await Promise.all([listRecipes(), listInventory()]);
      setRecipeRows(rows);
      setInventory(inv);
      if (!sel && rows.length) setSel(rows[0].name);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const base = useMemo(() => recipeRows.find(r => r.name === sel)?.cost || 0, [recipeRows, sel]);
  // Recipe total based on selected recipe and quantity
  const recipeTotal = Number((base * Number(qty || 0)).toFixed(2));

  // Determine allowed unit options based on an inventory item's base unit family
  const unitOptionsFor = (inv) => {
    const bu = baseUnit(inv?.unit || "g");
    if (bu === "g") return ["g", "kg"];
    if (bu === "ml") return ["ml", "l"];
    return ["ea"]; // default to count
  };

  // Sum of all ad-hoc ingredient rows
  const ingredientTotal = ings.reduce((sum, row) => {
    const inv = inventory.find(i => i.id === row.invId);
    const ppu = Number(inv?.ppu ?? NaN);
    const qtyBase = toBaseQty(row.qty || 0, row.unit || inv?.unit || "g");
    if (!Number.isFinite(ppu) || !Number.isFinite(qtyBase)) return sum;
    return sum + ppu * qtyBase;
  }, 0);

  const total = (recipeTotal + ingredientTotal).toFixed(2);

  const addIng = () => {
    const first = inventory[0];
    setIngs(prev => ([...prev, { invId: first?.id ?? null, unit: first?.unit ?? "g", qty: "" }]));
  };
  const updateIng = (idx, patch) => setIngs(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  const removeIng = (idx) => setIngs(prev => prev.filter((_, i) => i !== idx));

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
      <SectionTitle icon={FileSpreadsheet} title="Dynamic Price Calculator" hint="Estimate the cost using recipes and/or ad‑hoc ingredients based on live inventory prices" />
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
        <HintTooltip hint="Select which recipe you want to cost">
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel>Recipe</InputLabel>
            <Select label="Recipe" value={sel} onChange={(e) => setSel(e.target.value)} disabled={recipeRows.length === 0}>
              {recipeRows.map((r) => <MenuItem key={r.id ?? r.name} value={r.name}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
        </HintTooltip>
        {/* Quantity input: keep raw string so it can be empty; type=number still provides numeric keypad & validation */}
        <HintTooltip hint="Enter how many servings you want to make">
          <TextField
            label="Quantity"
            type="number"
            value={qty}
            onChange={(e) => {
              const v = e.target.value;
              // Allow empty input by storing ""; otherwise store raw string. We don't convert here
              // to avoid showing 0 when the user clears the field.
              if (v === "") {
                setQty("");
              } else {
                setQty(v);
              }
            }}
            inputProps={{ min: 0 }}
            placeholder="Enter quantity"
          />
        </HintTooltip>
        <HintTooltip hint="Add an ad‑hoc ingredient row to include in the total">
          <Button variant="outlined" startIcon={<Plus size={16} />} onClick={addIng} disabled={inventory.length === 0}>
            Add Ingredient
          </Button>
        </HintTooltip>
      </Box>
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {recipeRows.length ? 'Select a recipe and quantity. Optionally add extra ingredients below.' : 'No recipes found. You can still add ad‑hoc ingredients below.'}
          </Typography>
          {ings.length > 0 && (
            <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
              {ings.map((row, idx) => {
                const inv = inventory.find(i => i.id === row.invId);
                const unitOpts = unitOptionsFor(inv);
                const rowCost = (() => {
                  const ppu = Number(inv?.ppu ?? NaN);
                  const qb = toBaseQty(row.qty || 0, row.unit || inv?.unit || 'g');
                  if (!Number.isFinite(ppu) || !Number.isFinite(qb)) return 0;
                  return ppu * qb;
                })();
                return (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 120px 120px 140px auto', gap: 1 }}>
                    <FormControl size="small">
                      <InputLabel>Ingredient</InputLabel>
                      <Select
                        label="Ingredient"
                        value={row.invId ?? ''}
                        onChange={(e) => {
                          const nextInv = inventory.find(i => i.id === e.target.value);
                          updateIng(idx, { invId: e.target.value, unit: nextInv?.unit ?? row.unit });
                        }}
                      >
                        {inventory.map((i) => (
                          <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Qty"
                      type="number"
                      value={row.qty}
                      onChange={(e) => updateIng(idx, { qty: e.target.value })}
                      inputProps={{ min: 0 }}
                    />
                    <FormControl size="small">
                      <InputLabel>Unit</InputLabel>
                      <Select
                        label="Unit"
                        value={row.unit || inv?.unit || unitOpts[0]}
                        onChange={(e) => updateIng(idx, { unit: e.target.value })}
                      >
                        {unitOpts.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Cost"
                      value={currency(rowCost.toFixed(2))}
                      InputProps={{ readOnly: true }}
                    />
                    <IconButton color="error" onClick={() => removeIng(idx)} size="small"><Trash2 size={16} /></IconButton>
                  </Box>
                );
              })}
            </Box>
          )}
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            Calculation Summary
          </Typography>
          <Box sx={{ display: 'grid', gap: 0.75 }}>
            <Typography variant="body2">Recipe cost: {currency(recipeTotal.toFixed(2))}</Typography>
            <Typography variant="body2">Extra ingredients: {currency(ingredientTotal.toFixed(2))}</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
              Total Estimated Cost: {currency(total)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CalculatorPage;
