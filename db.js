// db.js
// Purpose: Dexie (IndexedDB) database initialization and schema versions.
// Rationale: We evolve the schema using Dexie versioning; each version
// declares object stores and indexes. Increment versions as new stores/fields
// are introduced to keep client data migratable.

import Dexie from "dexie";

export const db = new Dexie("INSY7315DB");

// v2: initial app stores (sessions, inventory, recipes, notifications, sales)
db.version(2).stores({
  // sessions: track user sessions
  sessions: "++id,email,role,ts",
  // inventory: stores purchasing info and derived ppu (computed in service)
  inventory: "++id,name,qty,unit,expiry,cost",
  // recipes: store name/type/cost; ingredients are embedded per recipe
  recipes:   "++id,name,type,cost",
  // notifications: UI alerts (low stock, events)
  notifications: "++id,tone,msg,ago",
  // sales: aggregate sales entries for reports
  sales: "++id,date,amount,cost", 
});

// v3: add users store (authentication/roles)
db.version(3).stores({
  sessions: "++id,email,role,ts",
  users: "++id,email,passwordHash,role,createdAt",
  inventory: "++id,name,qty,unit,expiry,cost",
  recipes:   "++id,name,type,cost",
  notifications: "++id,tone,msg,ago",
  sales: "++id,date,amount,cost",
});

// v4: extend sessions, add auditLogs store for audit trail
db.version(4).stores({
  sessions: "++id,email,role,userId,ts",
  users: "++id,email,passwordHash,role,createdAt",
  inventory: "++id,name,qty,unit,expiry,cost",
  recipes:   "++id,name,type,cost",
  notifications: "++id,tone,msg,ago",
  sales: "++id,date,amount,cost",
  // auditLogs: append-only audit of important actions
  auditLogs: "++id,userId,userEmail,action,timestamp,category",
});


