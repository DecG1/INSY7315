// Mock notifications for dashboard and alerts
export const mockNotifications = [
  { id: 1, type: "Low Stock", msg: "Olive Oil (Extra Virgin) – 2 liters remaining", ago: "2h", tone: "error" },
  { id: 2, type: "Expiry", msg: "Mozzarella – expires in 3 days", ago: "4h", tone: "warning" },
  { id: 3, type: "Order", msg: "New Order #12345 from Table 7", ago: "30m", tone: "info" },
];

// Mock inventory items
export const mockInventory = [
  { name: "San Marzano Tomatoes", qty: 20, unit: "kg", expiry: "2026-08-28", cost: 2.50 },
  { name: "Fresh Basil", qty: 500, unit: "g", expiry: "2025-09-02", cost: 0.15 },
  { name: "Parmigiano Reggiano", qty: 10, unit: "kg", expiry: "2025-11-26", cost: 18.00 },
  { name: "Olive Oil (Extra Virgin)", qty: 25, unit: "L", expiry: "2026-03-16", cost: 7.00 },
  { name: "Durum Wheat Flour", qty: 100, unit: "kg", expiry: "2025-07-29", cost: 1.20 },
];

// Mock weekly finances for charts
export const weeklyFinances = [
  { day: "Mon", sales: 4200, costs: 2100 },
  { day: "Tue", sales: 4800, costs: 2300 },
  { day: "Wed", sales: 6000, costs: 2500 },
  { day: "Thu", sales: 5200, costs: 2400 },
  { day: "Fri", sales: 5800, costs: 2600 },
  { day: "Sat", sales: 5900, costs: 3000 },
  { day: "Sun", sales: 3100, costs: 1700 },
];

// Mock ingredient price list
export const priceList = [
  { name: "Fresh Tomatoes (per kg)", price: 25.50, updated: "2024-07-20" },
  { name: "Mozzarella Cheese (per kg)", price: 120.00, updated: "2024-07-18" },
  { name: "Italian Flour (per kg)", price: 15.75, updated: "2024-07-19" },
  { name: "Olive Oil (per liter)", price: 95.00, updated: "2024-07-20" },
  { name: "Truffle Oil (per 100ml)", price: 250.00, updated: "2024-07-17" },
];

// Mock recipes for recipe management
export const recipes = [
  { name: "Spaghetti Carbonara", type: "Main Course", cost: 85.50 },
  { name: "Mushroom Risotto", type: "Main Course", cost: 92.75 },
  { name: "Caprese Salad", type: "Starter", cost: 55.20 },
  { name: "Tiramisu", type: "Dessert", cost: 70.00 },
  { name: "Minestrone Soup", type: "Starter", cost: 60.10 },
  { name: "Pizza Margherita", type: "Main Course", cost: 110.00 },
];

// Mock dish profitability data for reports
export const dishProfitability = [
  { dish: "Spaghetti Carbonara", sales: 1200, cost: 450, profit: 750, tag: "High" },
  { dish: "Focaccia", sales: 300, cost: 100, profit: 200, tag: "Low" },
  { dish: "Pizza Margherita", sales: 1800, cost: 900, profit: 900, tag: "Medium" },
];

// Mock ingredient cost trends for analytics
export const costTrends = [
  { month: "Jan", tomatoes: 22, mozzarella: 115, flour: 14 },
  { month: "Feb", tomatoes: 24, mozzarella: 116, flour: 14.5 },
  { month: "Mar", tomatoes: 26, mozzarella: 119, flour: 15 },
  { month: "Apr", tomatoes: 25, mozzarella: 118, flour: 15.2 },
  { month: "May", tomatoes: 27, mozzarella: 121, flour: 15.5 },
  { month: "Jun", tomatoes: 28, mozzarella: 123, flour: 16 },
  { month: "Jul", tomatoes: 26, mozzarella: 120, flour: 15.8 },
  { month: "Aug", tomatoes: 27, mozzarella: 122, flour: 16.2 },
  { month: "Sep", tomatoes: 29, mozzarella: 125, flour: 16.8 },
  { month: "Oct", tomatoes: 30, mozzarella: 126, flour: 17 },
  { month: "Nov", tomatoes: 31, mozzarella: 127, flour: 17.2 },
  { month: "Dec", tomatoes: 32, mozzarella: 128, flour: 17.5 },
];

// Mock inventory depletion data for analytics
export const depletion = [
  { item: "Tomatoes", qty: 250 },
  { item: "Mozzarella", qty: 190 },
  { item: "Olive Oil", qty: 160 },
  { item: "Flour", qty: 140 },
];
