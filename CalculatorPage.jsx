import React, { useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Divider, Button, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { FileSpreadsheet } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { listRecipes } from "./recipesService.js";
import { currency } from "./helpers.js";

const CalculatorPage = () => {
  const [recipeRows, setRecipeRows] = useState([]);
  const [sel, setSel] = useState("");
  const [qty, setQty] = useState(1);

  React.useEffect(() => {
    (async () => {
      const rows = await listRecipes();
      setRecipeRows(rows);
      if (!sel && rows.length) setSel(rows[0].name);
    })();
  }, []);

  const base = useMemo(() => recipeRows.find(r => r.name === sel)?.cost || 0, [recipeRows, sel]);
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
        <TextField label="Quantity" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} inputProps={{ min: 0 }} />
        <Button variant="contained" color="error" disabled={recipeRows.length === 0}>Calculate</Button>
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
