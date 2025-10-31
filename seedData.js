// seedData.js
// Seed the database with sample data for demonstration purposes

import { db } from "./db.js";
import { addRecipe } from "./recipesService.js";
import { addInventoryItem } from "./inventoryService.js";
import { addSale } from "./analyticsService.js";

/**
 * Sample inventory items with realistic pricing and quantities
 */
const sampleInventory = [
  // Proteins
  { name: "Chicken Breast", qty: 15, unit: "kg", expiry: getDateDaysFromNow(14), cost: 85.00, category: "Protein" },
  { name: "Beef Mince", qty: 10, unit: "kg", expiry: getDateDaysFromNow(7), cost: 120.00, category: "Protein" },
  { name: "Salmon Fillet", qty: 5, unit: "kg", expiry: getDateDaysFromNow(5), cost: 180.00, category: "Seafood" },
  { name: "Prawns", qty: 3, unit: "kg", expiry: getDateDaysFromNow(4), cost: 250.00, category: "Seafood" },
  { name: "Pork Chops", qty: 8, unit: "kg", expiry: getDateDaysFromNow(10), cost: 95.00, category: "Protein" },
  
  // Vegetables
  { name: "Tomatoes", qty: 12, unit: "kg", expiry: getDateDaysFromNow(8), cost: 25.00, category: "Vegetables" },
  { name: "Onions", qty: 20, unit: "kg", expiry: getDateDaysFromNow(30), cost: 18.00, category: "Vegetables" },
  { name: "Garlic", qty: 2, unit: "kg", expiry: getDateDaysFromNow(20), cost: 45.00, category: "Vegetables" },
  { name: "Bell Peppers", qty: 8, unit: "kg", expiry: getDateDaysFromNow(7), cost: 35.00, category: "Vegetables" },
  { name: "Mushrooms", qty: 5, unit: "kg", expiry: getDateDaysFromNow(5), cost: 55.00, category: "Vegetables" },
  { name: "Spinach", qty: 4, unit: "kg", expiry: getDateDaysFromNow(6), cost: 30.00, category: "Vegetables" },
  { name: "Lettuce", qty: 6, unit: "kg", expiry: getDateDaysFromNow(7), cost: 22.00, category: "Vegetables" },
  { name: "Carrots", qty: 10, unit: "kg", expiry: getDateDaysFromNow(21), cost: 15.00, category: "Vegetables" },
  { name: "Broccoli", qty: 7, unit: "kg", expiry: getDateDaysFromNow(8), cost: 38.00, category: "Vegetables" },
  
  // Dairy & Eggs
  { name: "Mozzarella", qty: 5, unit: "kg", expiry: getDateDaysFromNow(15), cost: 85.00, category: "Dairy" },
  { name: "Parmesan", qty: 3, unit: "kg", expiry: getDateDaysFromNow(60), cost: 180.00, category: "Dairy" },
  { name: "Cream", qty: 8, unit: "l", expiry: getDateDaysFromNow(10), cost: 45.00, category: "Dairy" },
  { name: "Butter", qty: 4, unit: "kg", expiry: getDateDaysFromNow(30), cost: 65.00, category: "Dairy" },
  { name: "Eggs", qty: 30, unit: "ea", expiry: getDateDaysFromNow(21), cost: 2.50, category: "Dairy" },
  { name: "Milk", qty: 15, unit: "l", expiry: getDateDaysFromNow(7), cost: 18.00, category: "Dairy" },
  
  // Grains & Pasta
  { name: "Pasta", qty: 15, unit: "kg", expiry: getDateDaysFromNow(365), cost: 35.00, category: "Grains" },
  { name: "Rice", qty: 25, unit: "kg", expiry: getDateDaysFromNow(365), cost: 28.00, category: "Grains" },
  { name: "Flour", qty: 20, unit: "kg", expiry: getDateDaysFromNow(180), cost: 22.00, category: "Grains" },
  { name: "Bread", qty: 8, unit: "kg", expiry: getDateDaysFromNow(5), cost: 25.00, category: "Grains" },
  
  // Sauces & Oils
  { name: "Olive Oil", qty: 10, unit: "l", expiry: getDateDaysFromNow(365), cost: 120.00, category: "Oils" },
  { name: "Tomato Sauce", qty: 12, unit: "kg", expiry: getDateDaysFromNow(180), cost: 35.00, category: "Sauces" },
  { name: "Pesto", qty: 3, unit: "kg", expiry: getDateDaysFromNow(90), cost: 85.00, category: "Sauces" },
  { name: "Balsamic Vinegar", qty: 2, unit: "l", expiry: getDateDaysFromNow(365), cost: 95.00, category: "Sauces" },
  
  // Herbs & Spices
  { name: "Basil", qty: 1, unit: "kg", expiry: getDateDaysFromNow(7), cost: 45.00, category: "Herbs" },
  { name: "Oregano", qty: 0.5, unit: "kg", expiry: getDateDaysFromNow(180), cost: 65.00, category: "Herbs" },
  { name: "Black Pepper", qty: 1, unit: "kg", expiry: getDateDaysFromNow(365), cost: 120.00, category: "Spices" },
  { name: "Salt", qty: 5, unit: "kg", expiry: getDateDaysFromNow(365), cost: 12.00, category: "Spices" },
  { name: "Chilli Flakes", qty: 0.5, unit: "kg", expiry: getDateDaysFromNow(365), cost: 85.00, category: "Spices" },
  
  // Dessert Items
  { name: "Sugar", qty: 10, unit: "kg", expiry: getDateDaysFromNow(365), cost: 18.00, category: "Baking" },
  { name: "Chocolate", qty: 5, unit: "kg", expiry: getDateDaysFromNow(180), cost: 95.00, category: "Dessert" },
  { name: "Vanilla Extract", qty: 0.5, unit: "l", expiry: getDateDaysFromNow(365), cost: 180.00, category: "Baking" },
  { name: "Cocoa Powder", qty: 2, unit: "kg", expiry: getDateDaysFromNow(365), cost: 125.00, category: "Baking" },
  
  // Beverages
  { name: "Coffee Beans", qty: 5, unit: "kg", expiry: getDateDaysFromNow(90), cost: 180.00, category: "Beverages" },
  { name: "Orange Juice", qty: 10, unit: "l", expiry: getDateDaysFromNow(14), cost: 35.00, category: "Beverages" },
  { name: "Wine", qty: 12, unit: "l", expiry: getDateDaysFromNow(730), cost: 85.00, category: "Beverages" },
];

/**
 * Sample recipes with ingredients
 */
const sampleRecipes = [
  {
    name: "Margherita Pizza",
    type: "Main Course",
    instructions: "1. Prepare pizza dough and let it rise\n2. Roll out dough into circle\n3. Spread tomato sauce\n4. Add mozzarella and basil\n5. Bake at 220°C for 12-15 minutes",
    ingredients: [
      { name: "Flour", qty: 0.3, unit: "kg" },
      { name: "Tomato Sauce", qty: 0.15, unit: "kg" },
      { name: "Mozzarella", qty: 0.25, unit: "kg" },
      { name: "Basil", qty: 0.01, unit: "kg" },
      { name: "Olive Oil", qty: 0.02, unit: "l" },
    ]
  },
  {
    name: "Chicken Alfredo Pasta",
    type: "Main Course",
    instructions: "1. Cook pasta until al dente\n2. Sauté chicken in olive oil\n3. Make alfredo sauce with cream, butter, and parmesan\n4. Combine pasta, chicken, and sauce\n5. Garnish with parsley",
    ingredients: [
      { name: "Pasta", qty: 0.4, unit: "kg" },
      { name: "Chicken Breast", qty: 0.3, unit: "kg" },
      { name: "Cream", qty: 0.3, unit: "l" },
      { name: "Parmesan", qty: 0.1, unit: "kg" },
      { name: "Butter", qty: 0.05, unit: "kg" },
      { name: "Garlic", qty: 0.02, unit: "kg" },
    ]
  },
  {
    name: "Grilled Salmon",
    type: "Main Course",
    instructions: "1. Season salmon with salt, pepper, and herbs\n2. Brush with olive oil\n3. Grill for 4-5 minutes per side\n4. Serve with lemon wedges and vegetables",
    ingredients: [
      { name: "Salmon Fillet", qty: 0.25, unit: "kg" },
      { name: "Olive Oil", qty: 0.02, unit: "l" },
      { name: "Lemon", qty: 1, unit: "ea" },
      { name: "Broccoli", qty: 0.15, unit: "kg" },
      { name: "Carrots", qty: 0.1, unit: "kg" },
    ]
  },
  {
    name: "Caesar Salad",
    type: "Starter",
    instructions: "1. Chop lettuce into bite-sized pieces\n2. Make dressing with mayo, parmesan, garlic, and lemon\n3. Toss lettuce with dressing\n4. Add croutons and extra parmesan\n5. Top with grilled chicken if desired",
    ingredients: [
      { name: "Lettuce", qty: 0.3, unit: "kg" },
      { name: "Parmesan", qty: 0.05, unit: "kg" },
      { name: "Garlic", qty: 0.01, unit: "kg" },
      { name: "Olive Oil", qty: 0.03, unit: "l" },
      { name: "Bread", qty: 0.1, unit: "kg" },
    ]
  },
  {
    name: "Tiramisu",
    type: "Dessert",
    instructions: "1. Brew strong coffee and let cool\n2. Mix mascarpone with sugar and eggs\n3. Dip ladyfingers in coffee\n4. Layer biscuits and cream\n5. Dust with cocoa powder\n6. Refrigerate for 4 hours",
    ingredients: [
      { name: "Coffee Beans", qty: 0.05, unit: "kg" },
      { name: "Eggs", qty: 4, unit: "ea" },
      { name: "Sugar", qty: 0.15, unit: "kg" },
      { name: "Cocoa Powder", qty: 0.03, unit: "kg" },
      { name: "Flour", qty: 0.2, unit: "kg" },
    ]
  },
  {
    name: "Beef Bolognese",
    type: "Main Course",
    instructions: "1. Brown beef mince with onions and garlic\n2. Add tomatoes, tomato sauce, and herbs\n3. Simmer for 45 minutes\n4. Cook pasta separately\n5. Serve sauce over pasta with parmesan",
    ingredients: [
      { name: "Beef Mince", qty: 0.4, unit: "kg" },
      { name: "Tomatoes", qty: 0.3, unit: "kg" },
      { name: "Tomato Sauce", qty: 0.2, unit: "kg" },
      { name: "Onions", qty: 0.15, unit: "kg" },
      { name: "Garlic", qty: 0.02, unit: "kg" },
      { name: "Pasta", qty: 0.4, unit: "kg" },
      { name: "Parmesan", qty: 0.05, unit: "kg" },
    ]
  },
  {
    name: "Mushroom Risotto",
    type: "Main Course",
    instructions: "1. Sauté onions and garlic in butter\n2. Add rice and toast for 2 minutes\n3. Add wine and stir until absorbed\n4. Gradually add hot stock, stirring constantly\n5. Stir in mushrooms and parmesan\n6. Finish with butter",
    ingredients: [
      { name: "Rice", qty: 0.35, unit: "kg" },
      { name: "Mushrooms", qty: 0.25, unit: "kg" },
      { name: "Onions", qty: 0.1, unit: "kg" },
      { name: "Garlic", qty: 0.01, unit: "kg" },
      { name: "Butter", qty: 0.08, unit: "kg" },
      { name: "Parmesan", qty: 0.08, unit: "kg" },
      { name: "Wine", qty: 0.15, unit: "l" },
    ]
  },
  {
    name: "Prawn Pasta",
    type: "Main Course",
    instructions: "1. Cook pasta until al dente\n2. Sauté prawns with garlic and chilli\n3. Add cherry tomatoes and white wine\n4. Toss with pasta and fresh basil\n5. Drizzle with olive oil",
    ingredients: [
      { name: "Pasta", qty: 0.4, unit: "kg" },
      { name: "Prawns", qty: 0.3, unit: "kg" },
      { name: "Tomatoes", qty: 0.2, unit: "kg" },
      { name: "Garlic", qty: 0.02, unit: "kg" },
      { name: "Chilli Flakes", qty: 0.005, unit: "kg" },
      { name: "Basil", qty: 0.01, unit: "kg" },
      { name: "Olive Oil", qty: 0.03, unit: "l" },
    ]
  },
  {
    name: "Chocolate Lava Cake",
    type: "Dessert",
    instructions: "1. Melt chocolate and butter together\n2. Whisk eggs and sugar until fluffy\n3. Fold in chocolate mixture and flour\n4. Pour into greased ramekins\n5. Bake at 200°C for 12 minutes\n6. Center should be molten",
    ingredients: [
      { name: "Chocolate", qty: 0.2, unit: "kg" },
      { name: "Butter", qty: 0.1, unit: "kg" },
      { name: "Eggs", qty: 4, unit: "ea" },
      { name: "Sugar", qty: 0.1, unit: "kg" },
      { name: "Flour", qty: 0.05, unit: "kg" },
    ]
  },
];

/**
 * Sample orders for the past 30 days
 */
function generateSampleOrders() {
  const orders = [];
  const menuItems = [
    { name: "Margherita Pizza", price: 95.00, category: "food" },
    { name: "Pepperoni Pizza", price: 110.00, category: "food" },
    { name: "Chicken Alfredo", price: 125.00, category: "food" },
    { name: "Grilled Salmon", price: 165.00, category: "food" },
    { name: "Caesar Salad", price: 65.00, category: "food" },
    { name: "Beef Bolognese", price: 115.00, category: "food" },
    { name: "Mushroom Risotto", price: 105.00, category: "food" },
    { name: "Prawn Pasta", price: 145.00, category: "food" },
    { name: "Veal Piccata", price: 175.00, category: "food" },
    { name: "Lasagna", price: 95.00, category: "food" },
    
    { name: "Coca Cola", price: 25.00, category: "drinks" },
    { name: "Sprite", price: 25.00, category: "drinks" },
    { name: "Orange Juice", price: 35.00, category: "drinks" },
    { name: "Espresso", price: 28.00, category: "drinks" },
    { name: "Cappuccino", price: 35.00, category: "drinks" },
    { name: "Red Wine (glass)", price: 55.00, category: "drinks" },
    { name: "White Wine (glass)", price: 55.00, category: "drinks" },
    { name: "Beer", price: 35.00, category: "drinks" },
    { name: "Sparkling Water", price: 22.00, category: "drinks" },
    
    { name: "Tiramisu", price: 65.00, category: "dessert" },
    { name: "Chocolate Lava Cake", price: 70.00, category: "dessert" },
    { name: "Panna Cotta", price: 60.00, category: "dessert" },
    { name: "Gelato", price: 45.00, category: "dessert" },
    { name: "Cannoli", price: 55.00, category: "dessert" },
    { name: "Cheesecake", price: 68.00, category: "dessert" },
    
    { name: "Bread Basket", price: 35.00, category: "other" },
    { name: "Olives", price: 40.00, category: "other" },
    { name: "Bruschetta", price: 55.00, category: "other" },
  ];
  
  // Generate orders for the past 30 days
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    // Random number of orders per day (2-8)
    const ordersPerDay = Math.floor(Math.random() * 7) + 2;
    
    for (let i = 0; i < ordersPerDay; i++) {
      const orderDate = getDateDaysFromNow(-daysAgo);
      const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items per order
      const items = [];
      let total = 0;
      
      // Select random items
      for (let j = 0; j < numItems; j++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        items.push({
          name: item.name,
          price: item.price,
          quantity: 1,
        });
        total += item.price;
      }
      
      // Add some variation to total (tips/discounts)
      const variation = (Math.random() * 0.2 - 0.05) * total; // -5% to +15%
      total += variation;
      
      orders.push({
        date: orderDate.toISOString(),
        amount: Math.max(0, total),
        cost: total * 0.35, // Assume 35% cost
        items: items,
      });
    }
  }
  
  return orders;
}

/**
 * Helper function to get date n days from now
 */
function getDateDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Main seed function
 */
export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.inventory.clear();
    await db.recipes.clear();
    await db.sales.clear();
    
    // Seed inventory
    console.log("📦 Seeding inventory items...");
    for (const item of sampleInventory) {
      await db.inventory.add({
        name: item.name,
        quantity: item.qty,
        unit: item.unit,
        expiry: item.expiry,
        cost: item.cost,
        category: item.category,
      });
    }
    console.log(`✅ Added ${sampleInventory.length} inventory items`);
    
    // Seed recipes
    console.log("👨‍🍳 Seeding recipes...");
    for (const recipe of sampleRecipes) {
      // Map ingredient names to inventory IDs
      const ingredients = [];
      for (const ing of recipe.ingredients) {
        const invItem = await db.inventory.where("name").equals(ing.name).first();
        if (invItem) {
          ingredients.push({
            invId: invItem.id,
            name: ing.name,
            quantity: ing.qty,
            unit: ing.unit,
          });
        }
      }
      
      // Calculate recipe cost
      let totalCost = 0;
      for (const ing of ingredients) {
        const invItem = await db.inventory.get(ing.invId);
        if (invItem) {
          totalCost += (invItem.cost / invItem.quantity) * ing.quantity;
        }
      }
      
      await db.recipes.add({
        name: recipe.name,
        type: recipe.type,
        instructions: recipe.instructions,
        ingredients: ingredients,
        cost: totalCost,
      });
    }
    console.log(`✅ Added ${sampleRecipes.length} recipes`);
    
    // Seed orders
    console.log("🧾 Seeding order history...");
    const orders = generateSampleOrders();
    for (const order of orders) {
      await db.sales.add(order);
    }
    console.log(`✅ Added ${orders.length} historical orders`);
    
    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${sampleInventory.length} inventory items`);
    console.log(`   - ${sampleRecipes.length} recipes`);
    console.log(`   - ${orders.length} orders (past 30 days)`);
    
    return {
      success: true,
      inventory: sampleInventory.length,
      recipes: sampleRecipes.length,
      orders: orders.length,
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

/**
 * Quick seed function for testing
 */
export async function quickSeed() {
  const result = await seedDatabase();
  alert(`Database seeded successfully!\n\n${result.inventory} inventory items\n${result.recipes} recipes\n${result.orders} orders`);
  window.location.reload();
}
