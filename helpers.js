
// Brand color for the app
export const brandRed = "#8b0000";
// Light pink for backgrounds (e.g., login)
export const lightPink = "#ffebee";

/**
 * Format a number as ZAR currency (R xx.xx)
 * @param {number|string} v
 * @returns {string}
 */
export const currency = (v) => `R ${Number(v).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

/**
 * Today's date as a formatted string (e.g., Monday, 31 August 2025)
 */
export const todayStr = new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
