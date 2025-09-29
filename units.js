// units.js
export const BASE_OF = { g: "g", kg: "g", ml: "ml", l: "ml", ea: "ea" };
export const CONV = { g: 1, kg: 1000, ml: 1, l: 1000, ea: 1 };

export const toKey = (u="") => u.trim().toLowerCase();
export const baseUnit = (u) => BASE_OF[toKey(u)] ?? toKey(u);

/** qty in `fromUnit` -> qty in base unit (g/ml/ea) */
export function toBaseQty(qty, fromUnit) {
  const u = toKey(fromUnit);
  return Number(qty || 0) * (CONV[u] ?? 1);
}

/** qty in `fromUnit` -> qty in `toUnit` (only if same family) */
export function convertQty(qty, fromUnit, toUnit) {
  const f = toKey(fromUnit), t = toKey(toUnit);
  const bf = baseUnit(f), bt = baseUnit(t);
  if (bf !== bt) return NaN;
  return (Number(qty || 0) * (CONV[f] ?? 1)) / (CONV[t] ?? 1);
}
