
// RecipesPage: displays recipe list and add/edit form (UI only)
import React, { useState } from "react";
import { Box, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem, Divider, Typography, Button, IconButton, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { ChefHat, PlusCircle, Eye, Pencil, Trash2 } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import { recipes } from "../utils/mockData";
import { currency } from "../utils/helpers";

/**
 * RecipesPage
 * - Shows a list of recipes in a table
 * - Allows adding a new recipe (UI only, no backend)
 * - Uses mock data for recipes
 */
const RecipesPage = () => {
  // State for new recipe form
  const [newRecipe, setNewRecipe] = useState({ name: "", type: "Main Course", instructions: "", ingredients: [{ ing: "Pasta", qty: 500, unit: "g" }, { ing: "Tomato Sauce", qty: 400, unit: "ml" }] });
  // State for estimated cost
  const [estCost, setEstCost] = useState(0);

  // Calculate estimated cost based on ingredients (mock logic)
  const calculateCost = () => {
    const total = newRecipe.ingredients.reduce((a, i) => a + (i.qty / 100), 0);
    setEstCost(Number(total.toFixed(2)));
  };

  // Update an ingredient in the new recipe
  const updateIng = (idx, field, value) => {
    setNewRecipe((r) => {
      const copy = { ...r, ingredients: r.ingredients.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing) };
      return copy;
    });
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, p: 3 }}>
      {/* Recipe list table */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <SectionTitle icon={ChefHat} title="Recipe Overview" />
          {/* Search and filter controls (not functional) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField size="small" placeholder="Search by ingredient" />
            <FormControl size="small"><InputLabel>Dish Type</InputLabel><Select label="Dish Type" defaultValue="All"><MenuItem value="All">All</MenuItem><MenuItem value="Starter">Starter</MenuItem><MenuItem value="Main Course">Main Course</MenuItem><MenuItem value="Dessert">Dessert</MenuItem></Select></FormControl>
            <FormControl size="small"><InputLabel>Cost Range</InputLabel><Select label="Cost Range" defaultValue="Any"><MenuItem value="Any">Any</MenuItem><MenuItem value="<60">Below 60</MenuItem><MenuItem value=">=60">60 and above</MenuItem></Select></FormControl>
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
              {/* Render each recipe row */}
              {recipes.map((r) => (
                <TableRow key={r.name} hover>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{currency(r.cost)}</TableCell>
                  <TableCell align="right" className="space-x-1">
                    <IconButton><Eye size={16} /></IconButton>
                    <IconButton><Pencil size={16} /></IconButton>
                    <IconButton color="error"><Trash2 size={16} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination controls (static) */}
          <Box className="flex items-center justify-between mt-2">
            <Button disabled>Previous</Button>
            <Box className="flex items-center gap-1"><Button size="small" variant="outlined">1</Button><Button size="small">2</Button><Button size="small">3</Button></Box>
            <Button>Next</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Add new recipe form */}
      <Card>
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SectionTitle title="Add New Recipe" />
          <TextField label="Recipe Name" placeholder="Spaghetti Carbonara" fullWidth value={newRecipe.name} onChange={(e) => setNewRecipe(r => ({ ...r, name: e.target.value }))} />
          <FormControl fullWidth>
            <InputLabel>Dish Type</InputLabel>
            <Select label="Dish Type" value={newRecipe.type} onChange={(e) => setNewRecipe(r => ({ ...r, type: e.target.value }))}>
              <MenuItem value="Main Course">Main Course</MenuItem>
              <MenuItem value="Starter">Starter</MenuItem>
              <MenuItem value="Dessert">Dessert</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Cooking Instructions" multiline minRows={4} fullWidth value={newRecipe.instructions} onChange={(e) => setNewRecipe(r => ({ ...r, instructions: e.target.value }))} />

          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>Ingredients</Typography>
          {/* Ingredient fields */}
          {newRecipe.ingredients.map((ing, idx) => (
            <Box key={idx} className="grid grid-cols-12 gap-2">
              <Box className="col-span-5"><TextField fullWidth label="Ingredient" value={ing.ing} onChange={(e) => updateIng(idx, "ing", e.target.value)} /></Box>
              <Box className="col-span-4"><TextField fullWidth label="Quantity" type="number" value={ing.qty} onChange={(e) => updateIng(idx, "qty", Number(e.target.value))} /></Box>
              <Box className="col-span-3">
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select label="Unit" value={ing.unit} onChange={(e) => updateIng(idx, "unit", e.target.value)}>
                    <MenuItem value="g">g</MenuItem>
                    <MenuItem value="ml">ml</MenuItem>
                    <MenuItem value="kg">kg</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          ))}
          <Button startIcon={<PlusCircle size={16} />} onClick={() => setNewRecipe(r => ({ ...r, ingredients: [...r.ingredients, { ing: "", qty: 0, unit: "g" }] }))}>Add Ingredient</Button>

          {/* Cost calculation and save/cancel buttons */}
          <Box className="flex items-center gap-2">
            <Button variant="contained" color="success" onClick={calculateCost}>Calculate Cost</Button>
            <Typography variant="subtitle2">Estimated Cost: {currency(estCost)}</Typography>
          </Box>

          <Box className="flex gap-2">
            <Button variant="text">Cancel</Button>
            <Button variant="contained" color="error">Save Recipe</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecipesPage;
