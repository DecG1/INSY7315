
import { db } from "./db.js";

export const listRecipes = () => db.recipes.orderBy("name").toArray();
export const addRecipe = (recipe) => db.recipes.add(recipe);               // returns new id
export const updateRecipe = (id, patch) => db.recipes.update(id, patch);
export const deleteRecipe = (id) => db.recipes.delete(id);
