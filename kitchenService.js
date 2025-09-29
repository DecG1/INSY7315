// kitchenService.js
import { db } from "./db.js";
import { convertQty } from "./units.js";

/**
 * Cook a recipe (deduct inventory).
 * @param {object} recipe - { name, ingredients: [{invId, name, unit, qty}, ...] }
 * @param {object} opts   - { servings: number }
 * @returns {Promise<{ok: boolean, shortages?: Array}>}
 */
export async function cookRecipe(recipe, { servings = 1 } = {}) {
  const ingList = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  if (ingList.length === 0) {
    await db.notifications.add({ tone: "error", msg: `Recipe "${recipe?.name ?? ""}" has no ingredients.`, ago: "just now" });
    return { ok: false, shortages: [{ reason: "no-ingredients" }] };
  }

  // Pull all required inventory items
  const invIds = ingList.map(i => i.invId).filter(Boolean);
  const invRows = await db.inventory.bulkGet(invIds);
  const invMap = new Map(invRows.filter(Boolean).map(r => [r.id, r]));

  // Build deduction plan + detect shortages first
  const shortages = [];
  const plan = []; // [{ id, newQty }]

  for (const ing of ingList) {
    const inv = invMap.get(ing.invId);
    if (!inv) {
      shortages.push({ name: ing.name, reason: "missing-from-inventory" });
      continue;
    }
    const need = Number(ing.qty || 0) * Number(servings || 1);
    const needInInvUnit = convertQty(need, ing.unit, inv.unit); // convert to inventory unit
    if (!isFinite(needInInvUnit)) {
      shortages.push({ name: inv.name, reason: `incompatible units (${ing.unit} vs ${inv.unit})` });
      continue;
    }
    const available = Number(inv.qty || 0);
    if (available < needInInvUnit) {
      shortages.push({
        name: inv.name,
        needed: +needInInvUnit.toFixed(3),
        available: +available.toFixed(3),
        unit: inv.unit,
      });
      continue;
    }
    plan.push({ id: inv.id, newQty: +(available - needInInvUnit).toFixed(3) });
  }

  if (shortages.length) {
    await db.notifications.add({
      tone: "error",
      msg: `Insufficient stock for ${recipe.name}: ` + shortages.map(s => s.name).join(", "),
      ago: "just now",
    });
    return { ok: false, shortages };
  }

  // Apply deductions atomically; emit low-stock notifications if threshold crossed
  await db.transaction("rw", db.inventory, db.notifications, async () => {
    for (const { id, newQty } of plan) {
      await db.inventory.update(id, { qty: newQty });
      const item = await db.inventory.get(id);
      // If you store a per-item low-stock threshold as "reorder"
      const reorder = Number(item?.reorder ?? NaN);
      if (isFinite(reorder) && reorder > 0 && newQty <= reorder) {
        await db.notifications.add({
          tone: "error",
          msg: `Low stock: ${item.name} (${newQty} ${item.unit})`,
          ago: "just now",
        });
      }
    }
    await db.notifications.add({
      tone: "info",
      msg: `Cooked ${recipe.name} (x${servings})`,
      ago: "just now",
    });
  });

  return { ok: true };
}
