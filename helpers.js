
// Brand color for the app
export const brandRed = "#8b0000";
// Light pink for backgrounds (e.g., login)
export const lightPink = "#ffebee";

/**
 * Format a number as ZAR currency (R xx.xx)
 * Ensures exactly 2 decimals (fixes cases like R 1,234.567 showing 3 decimals)
 * @param {number|string} v
 * @returns {string}
 */
export const currency = (v) => {
	const n = Number(v);
	const safe = Number.isFinite(n) ? n : 0;
	return `R ${safe.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Today's date as a formatted string (e.g., Monday, 31 August 2025)
 */
export const todayStr = new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
