// Mock data for the application

export const recipes = [
  {
    name: "Pasta Carbonara",
    type: "Main Course",
    cost: 85,
    ingredients: [
      { name: "Pasta", qty: 200, unit: "g" },
      { name: "Bacon", qty: 100, unit: "g" },
      { name: "Eggs", qty: 2, unit: "ea" },
      { name: "Parmesan", qty: 50, unit: "g" },
    ],
  },
  {
    name: "Margherita Pizza",
    type: "Main Course",
    cost: 120,
    ingredients: [
      { name: "Dough", qty: 300, unit: "g" },
      { name: "Tomato Sauce", qty: 100, unit: "ml" },
      { name: "Mozzarella", qty: 150, unit: "g" },
      { name: "Basil", qty: 10, unit: "g" },
    ],
  },
  {
    name: "Caesar Salad",
    type: "Starter",
    cost: 65,
    ingredients: [
      { name: "Lettuce", qty: 200, unit: "g" },
      { name: "Croutons", qty: 50, unit: "g" },
      { name: "Parmesan", qty: 30, unit: "g" },
      { name: "Caesar Dressing", qty: 50, unit: "ml" },
    ],
  },
  {
    name: "Tiramisu",
    type: "Dessert",
    cost: 95,
    ingredients: [
      { name: "Mascarpone", qty: 250, unit: "g" },
      { name: "Ladyfingers", qty: 200, unit: "g" },
      { name: "Coffee", qty: 100, unit: "ml" },
      { name: "Cocoa Powder", qty: 20, unit: "g" },
    ],
  },
];

export const priceList = [
  { name: "Fresh Tomatoes (per kg)", price: 28.5, category: "Vegetables" },
  { name: "Mozzarella Cheese (per kg)", price: 145.0, category: "Dairy" },
  { name: "Pasta (per kg)", price: 35.0, category: "Grains" },
  { name: "Olive Oil (per L)", price: 125.0, category: "Oils" },
  { name: "Fresh Basil (per 100g)", price: 18.0, category: "Herbs" },
  { name: "Bacon (per kg)", price: 89.0, category: "Meat" },
  { name: "Eggs (per dozen)", price: 42.0, category: "Dairy" },
  { name: "Parmesan (per kg)", price: 285.0, category: "Dairy" },
  { name: "Lettuce (per head)", price: 15.0, category: "Vegetables" },
  { name: "Mascarpone (per kg)", price: 165.0, category: "Dairy" },
];
