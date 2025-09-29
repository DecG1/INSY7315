// inventoryService.js
import { db } from "./db.js";
import { toKey, baseUnit, CONV } from "./units.js";

export const listInventory = () => db.inventory.orderBy("name").toArray();

/**
 * Add item with TOTAL batch cost.
 * Stores:
 *  - cost: total batch cost
 *  - ppu:  price per base unit (g/ml/ea)
 */
export const addInventory = async (item) => {
  const { id, unit, qty, cost, ...rest } = item || {};
  const u = toKey(unit);
  const q = Number(qty || 0);
  const total = Number(cost || 0);
  const bu = baseUnit(u);               // g / ml / ea
  const factor = CONV[u] ?? 1;          // kg->1000, l->1000, g/ml/ea->1
  const denom = q * factor || 1;        // avoid div by 0
  const ppu = total / denom;            // price per base unit

  return db.inventory.add({
    ...rest,
    name: rest.name?.trim() || "",
    unit: u,
    qty: q,
    cost: total,        // total batch cost
    unitBase: bu,
    ppu                 // normalized price per base unit
  });
};

/**
 * Update item; recompute ppu if qty, unit, or cost changed.
 */
export const updateInventory = async (id, patch = {}) => {
  const current = await db.inventory.get(id);
  const u = toKey(patch.unit ?? current.unit);
  const q = Number(patch.qty ?? current.qty ?? 0);
  const total = Number(patch.cost ?? current.cost ?? 0);

  let next = { ...patch, unit: u };
  if ("qty" in patch || "unit" in patch || "cost" in patch) {
    const bu = baseUnit(u);
    const factor = CONV[u] ?? 1;
    const denom = q * factor || 1;
    next = { ...next, unitBase: bu, ppu: total / denom };
  }
  return db.inventory.update(id, next);
};

export const deleteInventory = (id) => db.inventory.delete(id);
