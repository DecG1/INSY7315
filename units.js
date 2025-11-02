// units.js
// Purpose: Centralize unit normalization and conversion helpers.
// Rationale: The app stores price-per-unit (ppu) normalized to base units
// (grams, millilitres, or each). Converting to base units ensures consistent
// costing no matter what unit a user enters (e.g., kg vs g, l vs ml).
// All inventory costing and recipe calculations rely on these helpers.

/**
 * Map of supported units to their base family. We treat:
 *  - mass in grams (g)
 *  - volume in millilitres (ml)
 *  - count as each (ea)
 */
export const BASE_OF = { g: "g", kg: "g", ml: "ml", l: "ml", ea: "ea" };
export const CONV = { g: 1, kg: 1000, ml: 1, l: 1000, ea: 1 };

export const toKey = (u="") => u.trim().toLowerCase();
export const baseUnit = (u) => BASE_OF[toKey(u)] ?? toKey(u);

/**
 * Convert a quantity from a specific unit to its base unit (g/ml/ea).
 * Example: toBaseQty(2, 'kg') -> 2000 (g)
 */
export function toBaseQty(qty, fromUnit) {
  const u = toKey(fromUnit);
  return Number(qty || 0) * (CONV[u] ?? 1);
}

/**
 * Convert a quantity across units in the same family.
 * If units are incompatible (e.g., g -> ml), returns NaN.
 */
export function convertQty(qty, fromUnit, toUnit) {
  const f = toKey(fromUnit), t = toKey(toUnit);
  const bf = baseUnit(f), bt = baseUnit(t);
  if (bf !== bt) return NaN;
  return (Number(qty || 0) * (CONV[f] ?? 1)) / (CONV[t] ?? 1);
}
