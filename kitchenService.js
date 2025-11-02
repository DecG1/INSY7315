// kitchenService.js
// Purpose: Apply recipe cooking operations to inventory (deduct stock) and
// emit notifications when low-stock thresholds are crossed.
// Rationale: We convert all quantities to compatible units before deduction
// to avoid subtle errors (e.g., trying to subtract grams from litres).
import { db } from "./db.js";
import { convertQty, toBaseQty, baseUnit } from "./units.js";

/**
 * Cook a recipe (deduct inventory).
 * Contract:
 *  - Inputs: recipe with ingredients [{ invId, name, unit, qty }], and servings multiplier.
 *  - Behavior: Validates inventory presence and unit compatibility; calculates total
 *    required per ingredient in the inventory unit; performs atomic deductions; logs
 *    low-stock notifications when thresholds (in base units) are reached.
 *  - Output: { ok: true } on success, or { ok: false, shortages } with details.
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

  // Build deduction plan + detect shortages first (no writes yet)
  const shortages = [];
  const plan = []; // [{ id, newQty }]

  for (const ing of ingList) {
    const inv = invMap.get(ing.invId);
    if (!inv) {
      shortages.push({ name: ing.name, reason: "missing-from-inventory" });
      continue;
    }
    const need = Number(ing.qty || 0) * Number(servings || 1);
  // Convert recipe-needed amount to the inventory unit
  // Note: convertQty returns NaN for incompatible families (e.g., g vs ml)
  const needInInvUnit = convertQty(need, ing.unit, inv.unit);
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
      // Low-stock threshold supports unit-aware value (reorderBase in base units).
      // We compare new quantity in base units vs thresholdBase for correctness.
      const base = baseUnit(item.unit);
      const thresholdBase = (() => {
        const rb = Number(item?.reorderBase ?? NaN);
        if (isFinite(rb) && rb > 0) return rb;
        const rLegacy = Number(item?.reorder ?? NaN);
        if (isFinite(rLegacy) && rLegacy > 0) return toBaseQty(rLegacy, item.unit);
        return NaN;
      })();
      const newQtyBase = toBaseQty(newQty, item.unit);
      if (isFinite(thresholdBase) && thresholdBase > 0 && newQtyBase <= thresholdBase) {
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
