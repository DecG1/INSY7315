import Dexie from "dexie";

export const db = new Dexie("INSY7315DB");


db.version(3).stores({
  sessions: "++id,email,role,ts",
  users: "++id,email,passwordHash,role,createdAt", // New users table with hashed passwords
  inventory: "++id,name,qty,unit,expiry,cost",
  recipes:   "++id,name,type,cost",
  notifications: "++id,tone,msg,ago",
  sales: "++id,date,amount,cost", 
});


