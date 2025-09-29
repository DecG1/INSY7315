import Dexie from "dexie";

export const db = new Dexie("INSY7315DB");


db.version(2).stores({
  sessions: "++id,email,role,ts",
  inventory: "++id,name,qty,unit,expiry,cost",
  recipes:   "++id,name,type,cost",
  notifications: "++id,tone,msg,ago",
  sales: "++id,date,amount,cost", 
});


