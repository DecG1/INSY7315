// MenuBuilderPage: Analyze recipe feasibility based on current inventory.
// Purpose: For each recipe, determine if it can be made, partially made, or
// missing ingredients, and estimate servings supported. Uses ID-based linking
// first (invId) and falls back to name matching for legacy data.
import React, { useEffect, useMemo, useState } from "react";
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
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import { Restaurant, CheckCircle, Warning, Cancel, Refresh } from "@mui/icons-material";
import SectionTitle from "./SectionTitle";
import { listRecipes } from "./recipesService";
import { listInventory } from "./inventoryService";
import { convertQty } from "./units";
import HintTooltip from "./HintTooltip";

/**
 * MenuBuilderPage Component
 * 
 * Smart menu builder that analyzes current inventory and suggests recipes
 * that can be prepared based on available ingredients.
 * 
 * Features:
 * - Automatically calculates ingredient availability
 * - Shows how many servings can be made for each recipe
 * - Color-coded status indicators (can make, partial, cannot make)
 * - Filters by recipe feasibility
 * - Detailed ingredient breakdown showing what's available vs needed
 * 
 * @returns {JSX.Element} Menu builder page component
 */
export default function MenuBuilderPage() {
  // State management for recipes and inventory data
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, canMake, partial, cannot

  /**
   * Load recipes and inventory data on component mount
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Fetch recipes and inventory from the database
   */
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recipesData, inventoryData] = await Promise.all([
        listRecipes(),
        listInventory(),
      ]);
      setRecipes(recipesData || []);
      setInventory(inventoryData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate recipe feasibility based on current inventory
   * 
   * For each recipe, this function:
   * 1. Checks if all required ingredients are in inventory
   * 2. Converts units to match between recipe and inventory
   * 3. Calculates maximum servings that can be made
   * 4. Determines overall recipe status (can make, partial, cannot)
   * 
   * @returns {Array} Array of recipe analysis objects with feasibility data
   */
  const analyzedRecipes = useMemo(() => {
    // Safety check - ensure recipes is an array
    if (!Array.isArray(recipes)) {
      return [];
    }
    
    return recipes.map((recipe) => {
      // Skip recipes without ingredients
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
        return {
          ...recipe,
          ingredientAnalysis: [],
          canMakeServings: 0,
          missingCount: 0,
          partialCount: 0,
          overallStatus: "cannot",
        };
      }

      // Track ingredient availability for this recipe
      const ingredientAnalysis = [];
      let canMakeServings = Infinity;
      let missingIngredients = 0;
      let partialIngredients = 0;

      // Analyze each ingredient in the recipe
      recipe.ingredients.forEach((recipeIng) => {
        // Skip invalid ingredients
        if (!recipeIng || !recipeIng.name) {
          return;
        }

        // Prefer ID-based linking for accuracy; fallback to name for legacy
        const inventoryItem = recipeIng.invId
          ? inventory.find((inv) => inv.id === recipeIng.invId)
          : inventory.find((inv) => inv.name.toLowerCase() === recipeIng.name.toLowerCase());

        if (!inventoryItem) {
          // Ingredient not in inventory
          missingIngredients++;
          ingredientAnalysis.push({
            name: recipeIng.name,
            needed: recipeIng.quantity || 0,
            available: 0,
            unit: recipeIng.unit || "unit",
            status: "missing",
            canMake: 0,
          });
          canMakeServings = 0;
        } else {
          // Ingredient exists - convert units and calculate availability
          const needed = recipeIng.quantity || 0;
          let available = inventoryItem.quantity || 0;

          // Convert units if they don't match
          if (inventoryItem.unit !== recipeIng.unit) {
            const converted = convertQty(
              inventoryItem.quantity,
              inventoryItem.unit,
              recipeIng.unit
            );
            
            // Check if conversion was successful (not NaN)
            if (!isNaN(converted) && isFinite(converted)) {
              available = converted;
            } else {
              // If conversion fails, assume incompatible units - treat as missing
              console.warn(
                `Cannot convert ${inventoryItem.unit} to ${recipeIng.unit} for ${recipeIng.name}`
              );
              missingIngredients++;
              ingredientAnalysis.push({
                name: recipeIng.name,
                needed: recipeIng.quantity,
                available: 0,
                unit: recipeIng.unit,
                status: "missing",
                canMake: 0,
              });
              canMakeServings = 0;
              return; // Skip further processing for this ingredient
            }
          }

          // Calculate how many servings this ingredient can support
          const servingsFromThisIngredient = Math.floor(available / needed);

          // Track the minimum servings across all ingredients
          if (servingsFromThisIngredient < canMakeServings) {
            canMakeServings = servingsFromThisIngredient;
          }

          // Determine ingredient status
          let status;
          if (available >= needed) {
            status = "sufficient";
          } else if (available > 0) {
            status = "partial";
            partialIngredients++;
          } else {
            status = "missing";
            missingIngredients++;
          }

          ingredientAnalysis.push({
            name: recipeIng.name,
            needed,
            available,
            unit: recipeIng.unit,
            status,
            canMake: servingsFromThisIngredient,
          });
        }
      });

      // Determine overall recipe status
      let overallStatus;
      if (canMakeServings > 0 && missingIngredients === 0 && partialIngredients === 0) {
        overallStatus = "canMake";
      } else if (canMakeServings === 0 && missingIngredients === recipe.ingredients.length) {
        overallStatus = "cannot";
      } else {
        overallStatus = "partial";
      }

      return {
        ...recipe,
        ingredientAnalysis,
        canMakeServings: Math.max(0, canMakeServings === Infinity ? 0 : canMakeServings),
        missingCount: missingIngredients,
        partialCount: partialIngredients,
        overallStatus,
      };
    });
  }, [recipes, inventory]);

  /**
   * Filter recipes based on selected status filter
   */
  const filteredRecipes = useMemo(() => {
    if (filterStatus === "all") return analyzedRecipes;
    
    return analyzedRecipes.filter((recipe) => {
      if (filterStatus === "canMake") return recipe.overallStatus === "canMake";
      if (filterStatus === "partial") return recipe.overallStatus === "partial";
      if (filterStatus === "cannot") return recipe.overallStatus === "cannot";
      return true;
    });
  }, [analyzedRecipes, filterStatus]);

  /**
   * Get color for recipe status chip
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "canMake":
        return "success";
      case "partial":
        return "warning";
      case "cannot":
        return "error";
      default:
        return "default";
    }
  };

  /**
   * Get icon for recipe status
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case "canMake":
        return <CheckCircle />;
      case "partial":
        return <Warning />;
      case "cannot":
        return <Cancel />;
      default:
        return null;
    }
  };

  /**
   * Get status label text
   */
  const getStatusLabel = (recipe) => {
    if (recipe.overallStatus === "canMake") {
      return `Can make ${recipe.canMakeServings} serving${recipe.canMakeServings !== 1 ? "s" : ""}`;
    } else if (recipe.overallStatus === "partial") {
      return `Missing ${recipe.missingCount} ingredient${recipe.missingCount !== 1 ? "s" : ""}`;
    } else {
      return "Cannot make";
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Loading recipes and inventory...
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SectionTitle
        icon={Restaurant}
        title="Smart Menu Builder"
        subtitle="AI-powered recipe suggestions based on your current inventory"
      />

      {/* Filter Controls */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Filter by Status"
            sx={{ borderRadius: '10px' }}
          >
            <MenuItem value="all">All Recipes ({analyzedRecipes.length})</MenuItem>
            <MenuItem value="canMake">
              Can Make ({analyzedRecipes.filter((r) => r.overallStatus === "canMake").length})
            </MenuItem>
            <MenuItem value="partial">
              Partial ({analyzedRecipes.filter((r) => r.overallStatus === "partial").length})
            </MenuItem>
            <MenuItem value="cannot">
              Cannot Make ({analyzedRecipes.filter((r) => r.overallStatus === "cannot").length})
            </MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadData}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Refresh Data
        </Button>

        <HintTooltip text="The menu builder analyzes your inventory and shows which recipes you can make right now. Green recipes have all ingredients, yellow recipes are missing some, and red recipes cannot be made." />
      </Box>

      {/* Summary Alert */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 3,
          borderRadius: '12px',
          border: '1px solid rgba(33, 150, 243, 0.3)',
        }}
      >
        <strong>Inventory Analysis:</strong> You can fully prepare{" "}
        {analyzedRecipes.filter((r) => r.overallStatus === "canMake").length} recipe(s),
        partially prepare {analyzedRecipes.filter((r) => r.overallStatus === "partial").length}{" "}
        recipe(s), and are missing ingredients for{" "}
        {analyzedRecipes.filter((r) => r.overallStatus === "cannot").length} recipe(s).
      </Alert>

      {/* Recipe Cards */}
      <Grid container spacing={3}>
        {filteredRecipes.length === 0 ? (
          <Grid item xs={12}>
            <Alert 
              severity="warning"
              sx={{
                borderRadius: '12px',
                border: '1px solid rgba(255, 152, 0, 0.3)',
              }}
            >
              No recipes found. {filterStatus !== "all" && "Try changing the filter or "}
              Add recipes to get started!
            </Alert>
          </Grid>
        ) : (
          filteredRecipes.map((recipe) => (
            <Grid item xs={12} md={6} lg={4} key={recipe.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                  border: '2px solid',
                  borderColor:
                    recipe.overallStatus === "canMake"
                      ? "success.main"
                      : recipe.overallStatus === "partial"
                      ? "warning.main"
                      : "error.main",
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Recipe Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2, gap: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      {recipe.name}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(recipe.overallStatus)}
                      label={getStatusLabel(recipe)}
                      color={getStatusColor(recipe.overallStatus)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderRadius: '8px',
                        minWidth: 'fit-content',
                        flexShrink: 0,
                      }}
                    />
                  </Box>

                  {/* Recipe Description */}
                  {recipe.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {recipe.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Ingredient Analysis */}
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                    Ingredient Availability:
                  </Typography>

                  <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 1 }}>
                    {recipe.ingredientAnalysis.map((ing, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          mb: 1,
                          p: 1.5,
                          backgroundColor:
                            ing.status === "sufficient"
                              ? "rgba(76, 175, 80, 0.08)"
                              : ing.status === "partial"
                              ? "rgba(255, 152, 0, 0.08)"
                              : "rgba(244, 67, 54, 0.08)",
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor:
                            ing.status === "sufficient"
                              ? "rgba(76, 175, 80, 0.2)"
                              : ing.status === "partial"
                              ? "rgba(255, 152, 0, 0.2)"
                              : "rgba(244, 67, 54, 0.2)",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ing.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color:
                                ing.status === "sufficient"
                                  ? "success.main"
                                  : ing.status === "partial"
                                  ? "warning.main"
                                  : "error.main",
                            }}
                          >
                            {(ing.available || 0).toFixed(1)} / {(ing.needed || 0).toFixed(1)} {ing.unit}
                          </Typography>
                        </Box>
                        {ing.status === "sufficient" ? (
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                            ✓ Can make {ing.canMake || 0} serving{(ing.canMake || 0) !== 1 ? "s" : ""}
                          </Typography>
                        ) : ing.status === "partial" ? (
                          <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                            ⚠ Short by {((ing.needed || 0) - (ing.available || 0)).toFixed(1)} {ing.unit}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
                            ✗ Not in inventory
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>

                  {/* Servings Progress Bar */}
                  {recipe.canMakeServings > 0 && (
                    <Box sx={{ mt: 2.5, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.05)', borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Maximum servings:
                        </Typography>
                        <Chip 
                          label={recipe.canMakeServings} 
                          size="small" 
                          color="success" 
                          sx={{ fontWeight: 700, height: 24 }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (recipe.canMakeServings / 10) * 100)}
                        color="success"
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
