// analyticsService.js
import { db } from "./db.js";

// ----- Counts / lists -----
export const countInventory = () => db.inventory.count();
export const countRecipes   = () => db.recipes.count();
export const listNotifications = () =>
  db.notifications.orderBy("id").reverse().toArray();

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

// Utility to add a sale (for testing/chart input)
export function addSale({ date = new Date().toISOString(), amount, cost = 0 }) {
  return db.sales.add({ date, amount: Number(amount), cost: Number(cost) });
}
