import { db } from "./db.js"


export async function setSession({email, role, userId}){
    await db.sessions.clear();
    return db.sessions.add({email, role, userId, ts:Date.now()});

}

export async function getSession(){
    const rows=await db.sessions.toArray();
    return rows[0] ?? null;
}

export async function clearSession(){
    return db.sessions.clear();
}
