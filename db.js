import Dexie from "dexie";

export const db = new Dexie("INSY7315DB");


db.version(4).stores({
  sessions: "++id,email,role,ts",
  users: "++id,email,passwordHash,role,createdAt",
  inventory: "++id,name,qty,unit,expiry,cost",
  recipes:   "++id,name,type,cost",
  notifications: "++id,tone,msg,ago",
  sales: "++id,date,amount,cost",
  auditLogs: "++id,userId,userEmail,action,timestamp,category", // New audit log table
});


