import React, { useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Divider, Button, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { FileSpreadsheet } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { listRecipes } from "./recipesService.js";
import { currency } from "./helpers.js";

/**
 * CalculatorPage
 * Allows the user to select a recipe and enter a quantity to estimate total cost.
 * Note on quantity input: We intentionally keep the input value as a string so it can be empty
 * (no default 0 displayed). We only coerce to a number when performing calculations.
 */
const CalculatorPage = () => {
  const [recipeRows, setRecipeRows] = useState([]);
  const [sel, setSel] = useState("");
  // Quantity is stored as a string so the TextField can be truly empty (no auto 0).
  // This improves UX: users only see exactly what they type. Numeric coercion happens at compute time.
  const [qty, setQty] = useState("");

  React.useEffect(() => {
    (async () => {
      const rows = await listRecipes();
      setRecipeRows(rows);
      if (!sel && rows.length) setSel(rows[0].name);
    })();
  }, []);

  const base = useMemo(() => recipeRows.find(r => r.name === sel)?.cost || 0, [recipeRows, sel]);
  /**
   * Compute total cost.
   * - qty remains a string in state; here we convert it for arithmetic.
   * - If qty is "" (empty), treat as 0 for math, but do not display 0 in the input.
   */
  const total = (base * Number(qty || 0)).toFixed(2);

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
      <SectionTitle icon={FileSpreadsheet} title="Calculate Recipe Ingredients" />
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Recipe</InputLabel>
          <Select label="Recipe" value={sel} onChange={(e) => setSel(e.target.value)} disabled={recipeRows.length === 0}>
            {recipeRows.map((r) => <MenuItem key={r.id ?? r.name} value={r.name}>{r.name}</MenuItem>)}
          </Select>
        </FormControl>
        {/* Quantity input: keep raw string so it can be empty; type=number still provides numeric keypad & validation */}
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
        {/* Use default contained style from theme for uniform look across the app */}
        <Button variant="contained" disabled={recipeRows.length === 0}>Calculate</Button>
      </Box>
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {recipeRows.length ? 'Select a recipe and quantity to view ingredient breakdown.' : 'No recipes found. Create recipes first in the Recipes page.'}
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            Calculation Summary
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
            Total Estimated Cost: {currency(total)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CalculatorPage;
