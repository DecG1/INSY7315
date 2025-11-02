// Audit Service: Track user actions and system events
// Purpose: Centralized, non-blocking audit logging for key actions. We log
// descriptive messages plus a JSON payload of details. Errors during logging
// are swallowed (logged to console) so they don't break primary workflows.
import { db } from './db.js';
import { getSession } from './sessionService.js';

/**
 * Audit log categories for filtering and organization
 */
export const AuditCategory = {
  AUTH: 'Authentication',
  ORDER: 'Order Management',
  INVENTORY: 'Inventory Management',
  RECIPE: 'Recipe Management',
  USER: 'User Management',
  PRICING: 'Pricing Changes',
  SALES: 'Sales Entry',
  SYSTEM: 'System',
};

/**
 * Log an audit event
 * @param {string} action - Description of the action (e.g., "User logged in", "Order created")
 * @param {string} category - Category from AuditCategory
 * @param {object} details - Additional details about the action (will be JSON stringified)
 * @returns {Promise<number>} Audit log ID
 */
export async function logAudit(action, category, details = {}) {
  try {
    // Get current user session
    const session = await getSession();
    
    const auditEntry = {
      userId: session?.userId || null,
      userEmail: session?.email || 'system',
      action,
      category,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
    };
    
    const logId = await db.auditLogs.add(auditEntry);
    return logId;
  } catch (err) {
    console.error('Failed to log audit entry:', err);
    // Don't throw - audit logging should not break application flow
    return null;
  }
}

/**
 * Log user login event
 */
export async function logLogin(email, success) {
  return logAudit(
    success ? `User logged in: ${email}` : `Failed login attempt: ${email}`,
    AuditCategory.AUTH,
    { email, success }
  );
}

/**
 * Log user logout event
 */
export async function logLogout(email) {
  return logAudit(
    `User logged out: ${email}`,
    AuditCategory.AUTH,
    { email }
  );
}

/**
 * Log order creation
 */
export async function logOrderCreated(orderDetails) {
  return logAudit(
    `Order created with ${orderDetails.items?.length || 0} items`,
    AuditCategory.ORDER,
    orderDetails
  );
}

/**
 * Log inventory item added
 */
export async function logInventoryAdded(item) {
  return logAudit(
    `Added inventory item: ${item.name}`,
    AuditCategory.INVENTORY,
    { itemId: item.id, name: item.name, quantity: item.quantity, cost: item.cost }
  );
}

/**
 * Log inventory item updated
 */
export async function logInventoryUpdated(oldItem, newItem) {
  const changes = {};
  if (oldItem.quantity !== newItem.quantity) {
    changes.quantity = { from: oldItem.quantity, to: newItem.quantity };
  }
  if (oldItem.cost !== newItem.cost) {
    changes.cost = { from: oldItem.cost, to: newItem.cost };
  }
  if (oldItem.expiry !== newItem.expiry) {
    changes.expiry = { from: oldItem.expiry, to: newItem.expiry };
  }
  
  return logAudit(
    `Updated inventory item: ${newItem.name}`,
    AuditCategory.INVENTORY,
    { itemId: newItem.id, name: newItem.name, changes }
  );
}

/**
 * Log inventory item deleted
 */
export async function logInventoryDeleted(item) {
  return logAudit(
    `Deleted inventory item: ${item.name}`,
    AuditCategory.INVENTORY,
    { itemId: item.id, name: item.name, quantity: item.quantity }
  );
}

/**
 * Log recipe created
 */
export async function logRecipeCreated(recipe) {
  return logAudit(
    `Created recipe: ${recipe.name}`,
    AuditCategory.RECIPE,
    { recipeId: recipe.id, name: recipe.name }
  );
}

/**
 * Log recipe deleted
 */
export async function logRecipeDeleted(recipe) {
  return logAudit(
    `Deleted recipe: ${recipe.name}`,
    AuditCategory.RECIPE,
    { recipeId: recipe.id, name: recipe.name }
  );
}

/**
 * Log user created
 */
export async function logUserCreated(email, role) {
  return logAudit(
    `Created user: ${email}`,
    AuditCategory.USER,
    { email, role }
  );
}

/**
 * Log user role changed
 */
export async function logUserRoleChanged(email, oldRole, newRole) {
  return logAudit(
    `Changed role for ${email}: ${oldRole} → ${newRole}`,
    AuditCategory.USER,
    { email, oldRole, newRole }
  );
}

/**
 * Log user password changed
 */
export async function logUserPasswordChanged(email) {
  return logAudit(
    `Password changed for user: ${email}`,
    AuditCategory.USER,
    { email }
  );
}

/**
 * Log user deleted
 */
export async function logUserDeleted(email, role) {
  return logAudit(
    `Deleted user: ${email}`,
    AuditCategory.USER,
    { email, role }
  );
}

/**
 * Log pricing change
 */
export async function logPricingChanged(ingredient, oldPrice, newPrice) {
  return logAudit(
    `Updated pricing for ${ingredient}`,
    AuditCategory.PRICING,
    { ingredient, oldPrice, newPrice }
  );
}

/**
 * Log sales entry
 */
export async function logSalesEntry(amount, description) {
  return logAudit(
    `Sales entry: ${description}`,
    AuditCategory.SALES,
    { amount, description }
  );
}

/**
 * Get audit logs with optional limit
 */
export async function getAuditLogs(limit = 100) {
  return db.auditLogs.orderBy('timestamp').reverse().limit(limit).toArray();
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(userId, limit = 50) {
  return db.auditLogs.where('userId').equals(userId).reverse().limit(limit).toArray();
}

/**
 * Get recent login attempts
 */
export async function getRecentLogins(limit = 20) {
  return db.auditLogs
    .where('category').equals(AuditCategory.AUTH)
    .reverse()
    .limit(limit)
    .toArray();
}

/**
 * Get audit statistics
 */
export async function getAuditStats() {
  const logs = await db.auditLogs.toArray();
  const stats = {
    total: logs.length,
    byCategory: {},
    byUser: {},
    recent24h: 0,
  };
  
  const now = new Date().getTime();
  const day = 24 * 60 * 60 * 1000;
  
  logs.forEach(log => {
    stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    stats.byUser[log.userEmail] = (stats.byUser[log.userEmail] || 0) + 1;
    
    const logTime = new Date(log.timestamp).getTime();
    if (now - logTime < day) {
      stats.recent24h++;
    }
  });
  
  return stats;
}

/**
 * Clean up old audit logs (older than specified days)
 */
export async function cleanupOldLogs(daysToKeep = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);
  const cutoffISO = cutoff.toISOString();
  
  return db.auditLogs.where('timestamp').below(cutoffISO).delete();
}
