// recipesService.js
// Purpose: CRUD for recipes. A recipe has a set of ingredient rows
// where each row links to inventory via invId (preferred) and stores
// the unit/qty as used in the recipe context. Costing happens elsewhere
// by multiplying ingredient base-qty by the inventory ppu.
import { db } from "./db.js";

/** List all recipes ordered by name. */
export const listRecipes = () => db.recipes.orderBy("name").toArray();
/** Add a new recipe; returns the auto-generated ID. */
export const addRecipe = (recipe) => db.recipes.add(recipe);               // returns new id
/** Patch an existing recipe by ID. */
export const updateRecipe = (id, patch) => db.recipes.update(id, patch);
/** Delete a recipe by ID. */
export const deleteRecipe = (id) => db.recipes.delete(id);
