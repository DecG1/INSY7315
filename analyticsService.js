// analyticsService.js
import { db } from "./db.js";

// ----- Counts / lists -----
export const countInventory = () => db.inventory.count();
export const countRecipes   = () => db.recipes.count();
export const listNotifications = () =>
  db.notifications.orderBy("id").reverse().toArray();

// Count orders (sales) created today
export async function countOrdersToday() {
  const today = new Date().toDateString();
  const rows = await (db.sales?.toArray?.() ?? []);
  return rows.filter(r => new Date(r.date).toDateString() === today).length;
}

// ----- Weekly sales for dashboard chart (optional) -----
export async function weeklySales() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const rows = await db.sales?.filter?.(s => new Date(s.date) >= start).toArray?.() ?? [];

  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({ key: d.toDateString(), day: dayNames[d.getDay()], sales: 0, costs: 0 });
  }

  for (const r of rows) {
    const d = new Date(r.date);
    const key = new Date(d.toDateString()).toDateString();
    const bucket = days.find(x => x.key === key);
    if (bucket) {
      bucket.sales += Number(r.amount || 0);
      bucket.costs += Number(r.cost || 0);
    }
  }

  return days.map(({ key, ...rest }) => rest); // [{ day, sales, costs }]
}

/**
 * Monthly sales for dashboard chart
 * Returns daily sales data for the current month (1st to last day)
 * Used when user selects "Monthly" view on dashboard
 * @returns {Promise<Array>} Array of {day, sales, costs} for each day of current month
 */
export async function monthlySales() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(1); // First day of current month
  start.setHours(0, 0, 0, 0);

  // Fetch all sales from start of current month
  const rows = await db.sales?.filter?.(s => new Date(s.date) >= start).toArray?.() ?? [];

  // Get number of days in current month (28-31 depending on month)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  // Create buckets for each day of the month
  const days = [];
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(start);
    d.setDate(i + 1);
    days.push({ 
      key: d.toDateString(), 
      day: `${i + 1}`, // Day number (1-31)
      sales: 0, 
      costs: 0 
    });
  }

  // Aggregate sales into daily buckets
  for (const r of rows) {
    const d = new Date(r.date);
    const key = new Date(d.toDateString()).toDateString();
    const bucket = days.find(x => x.key === key);
    if (bucket) {
      bucket.sales += Number(r.amount || 0);
      bucket.costs += Number(r.cost || 0);
    }
  }

  return days.map(({ key, ...rest }) => rest); // [{ day, sales, costs }]
}

/**
 * Yearly sales for dashboard chart
 * Returns monthly sales data for the current year (Jan-Dec)
 * Used when user selects "Yearly" view on dashboard
 * @returns {Promise<Array>} Array of {day, sales, costs} for each month of current year
 */
export async function yearlySales() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1); // January 1st of current year
  start.setHours(0, 0, 0, 0);

  // Fetch all sales from start of current year
  const rows = await db.sales?.filter?.(s => new Date(s.date) >= start).toArray?.() ?? [];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const months = [];
  
  // Create buckets for each month of the year
  for (let i = 0; i < 12; i++) {
    months.push({ 
      key: i, 
      day: monthNames[i], // Month name for display (reusing 'day' field for consistency)
      sales: 0, 
      costs: 0 
    });
  }

  // Aggregate sales into monthly buckets
  for (const r of rows) {
    const d = new Date(r.date);
    const monthIndex = d.getMonth();
    const bucket = months.find(x => x.key === monthIndex);
    if (bucket) {
      bucket.sales += Number(r.amount || 0);
      bucket.costs += Number(r.cost || 0);
    }
  }

  return months.map(({ key, ...rest }) => rest); // [{ day, sales, costs }]
}

// Utility to add a sale (for testing/chart input)
export function addSale({ date = new Date().toISOString(), amount, cost = 0 }) {
  return db.sales.add({ date, amount: Number(amount), cost: Number(cost) });
}

/**
 * Count inventory items expiring soon (default: within 7 days, including today).
 * Mirrors the logic used by ExpiryChip: days <= 7 and >= 0.
 * Items without a valid expiry date are ignored.
 * @param {number} withinDays - Number of days from today to consider as "soon".
 * @returns {Promise<number>} Count of items expiring soon
 */
export async function countExpiringSoon(withinDays = 7) {
  const now = new Date();
  // Normalize current time to reduce edge-case drift; ExpiryChip uses live now
  const rows = await (db.inventory?.toArray?.() ?? []);
  let count = 0;
  for (const r of rows) {
    if (!r?.expiry) continue;
    const d = new Date(r.expiry);
    if (isNaN(d.getTime())) continue;
    const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (days <= withinDays && days >= 0) count++;
  }
  return count;
}
