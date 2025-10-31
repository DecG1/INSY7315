// Audit Service: Track user actions and system events
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
 * @param {string} email - User email
 * @param {boolean} success - Whether login was successful
 * @param {string} ipAddress - Optional IP address (not available in browser, placeholder for future)
 */
export async function logLogin(email, success = true, ipAddress = null) {
  return logAudit(
    success ? `User logged in: ${email}` : `Failed login attempt: ${email}`,
    AuditCategory.AUTH,
    { email, success, ipAddress, timestamp: new Date().toISOString() }
  );
}

/**
 * Log user logout event
 * @param {string} email - User email
 */
export async function logLogout(email) {
  return logAudit(
    `User logged out: ${email}`,
    AuditCategory.AUTH,
    { email, timestamp: new Date().toISOString() }
  );
}

/**
 * Log order creation
 * @param {object} orderData - Order details (items, total, gratuity, etc.)
 */
export async function logOrderCreated(orderData) {
  return logAudit(
    `Order created - Total: R ${orderData.total?.toFixed(2) || '0.00'}`,
    AuditCategory.ORDER,
    {
      itemCount: orderData.items?.length || 0,
      total: orderData.total,
      gratuity: orderData.gratuity,
      timestamp: new Date().toISOString(),
    }
  );
}

/**
 * Log inventory item addition
 * @param {object} item - Inventory item data
 */
export async function logInventoryAdded(item) {
  return logAudit(
    `Inventory item added: ${item.name}`,
    AuditCategory.INVENTORY,
    {
      itemName: item.name,
      quantity: item.qty,
      unit: item.unit,
      cost: item.cost,
    }
  );
}

/**
 * Log inventory item update
 * @param {object} oldItem - Previous item data
 * @param {object} newItem - Updated item data
 */
export async function logInventoryUpdated(oldItem, newItem) {
  return logAudit(
    `Inventory item updated: ${newItem.name}`,
    AuditCategory.INVENTORY,
    {
      itemName: newItem.name,
      changes: {
        quantity: { from: oldItem.qty, to: newItem.qty },
        cost: { from: oldItem.cost, to: newItem.cost },
        expiry: { from: oldItem.expiry, to: newItem.expiry },
      },
    }
  );
}

/**
 * Log inventory item deletion
 * @param {object} item - Deleted item data
 */
export async function logInventoryDeleted(item) {
  return logAudit(
    `Inventory item deleted: ${item.name}`,
    AuditCategory.INVENTORY,
    {
      itemName: item.name,
      quantity: item.qty,
      unit: item.unit,
    }
  );
}

/**
 * Log recipe creation
 * @param {object} recipe - Recipe data
 */
export async function logRecipeCreated(recipe) {
  return logAudit(
    `Recipe created: ${recipe.name}`,
    AuditCategory.RECIPE,
    {
      recipeName: recipe.name,
      type: recipe.type,
      cost: recipe.cost,
    }
  );
}

/**
 * Log recipe deletion
 * @param {object} recipe - Deleted recipe data
 */
export async function logRecipeDeleted(recipe) {
  return logAudit(
    `Recipe deleted: ${recipe.name}`,
    AuditCategory.RECIPE,
    {
      recipeName: recipe.name,
      type: recipe.type,
    }
  );
}

/**
 * Log user account creation
 * @param {string} email - New user email
 * @param {string} role - User role
 */
export async function logUserCreated(email, role) {
  return logAudit(
    `User account created: ${email}`,
    AuditCategory.USER,
    { email, role }
  );
}

/**
 * Log user role change
 * @param {string} email - User email
 * @param {string} oldRole - Previous role
 * @param {string} newRole - New role
 */
export async function logUserRoleChanged(email, oldRole, newRole) {
  return logAudit(
    `User role changed: ${email}`,
    AuditCategory.USER,
    { email, oldRole, newRole }
  );
}

/**
 * Log user password change
 * @param {string} email - User email
 */
export async function logUserPasswordChanged(email) {
  return logAudit(
    `Password changed for user: ${email}`,
    AuditCategory.USER,
    { email }
  );
}

/**
 * Log user deletion
 * @param {string} email - Deleted user email
 * @param {string} role - User role
 */
export async function logUserDeleted(email, role) {
  return logAudit(
    `User account deleted: ${email}`,
    AuditCategory.USER,
    { email, role }
  );
}

/**
 * Log pricing changes
 * @param {string} ingredientName - Ingredient name
 * @param {number} oldPrice - Previous price
 * @param {number} newPrice - New price
 */
export async function logPricingChanged(ingredientName, oldPrice, newPrice) {
  return logAudit(
    `Pricing updated for: ${ingredientName}`,
    AuditCategory.PRICING,
    {
      ingredient: ingredientName,
      oldPrice,
      newPrice,
      change: newPrice - oldPrice,
    }
  );
}

/**
 * Log sales entry
 * @param {object} saleData - Sales data
 */
export async function logSalesEntry(saleData) {
  return logAudit(
    `Sales entry added - Amount: R ${saleData.amount?.toFixed(2) || '0.00'}`,
    AuditCategory.SALES,
    {
      date: saleData.date,
      amount: saleData.amount,
      cost: saleData.cost,
    }
  );
}

/**
 * Get all audit logs with optional filtering
 * @param {object} filters - Optional filters { category, userId, startDate, endDate }
 * @param {number} limit - Maximum number of records to return (default: 100)
 * @returns {Promise<Array>} Array of audit log entries
 */
export async function getAuditLogs(filters = {}, limit = 100) {
  try {
    let query = db.auditLogs.orderBy('timestamp').reverse();
    
    // Apply category filter
    if (filters.category) {
      query = query.filter(log => log.category === filters.category);
    }
    
    // Apply user filter
    if (filters.userId) {
      query = query.filter(log => log.userId === filters.userId);
    }
    
    // Apply date range filter
    if (filters.startDate) {
      query = query.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      query = query.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }
    
    const logs = await query.limit(limit).toArray();
    
    // Parse details JSON
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : {},
      timeAgo: getTimeAgo(log.timestamp),
    }));
  } catch (err) {
    console.error('Failed to retrieve audit logs:', err);
    return [];
  }
}

/**
 * Get audit logs for a specific user
 * @param {number} userId - User ID
 * @param {number} limit - Maximum records to return
 * @returns {Promise<Array>} User's audit logs
 */
export async function getUserAuditLogs(userId, limit = 50) {
  return getAuditLogs({ userId }, limit);
}

/**
 * Get recent login activity
 * @param {number} limit - Maximum records to return
 * @returns {Promise<Array>} Recent login events
 */
export async function getRecentLogins(limit = 20) {
  return getAuditLogs({ category: AuditCategory.AUTH }, limit);
}

/**
 * Get audit log statistics
 * @returns {Promise<object>} Statistics object
 */
export async function getAuditStats() {
  try {
    const allLogs = await db.auditLogs.toArray();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = allLogs.filter(log => new Date(log.timestamp) >= today);
    
    const stats = {
      total: allLogs.length,
      today: todayLogs.length,
      byCategory: {},
      recentUsers: [],
    };
    
    // Count by category
    allLogs.forEach(log => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });
    
    // Get unique recent users
    const recentUserEmails = [...new Set(
      allLogs
        .slice(-50)
        .map(log => log.userEmail)
        .filter(email => email && email !== 'system')
    )];
    stats.recentUsers = recentUserEmails;
    
    return stats;
  } catch (err) {
    console.error('Failed to get audit stats:', err);
    return { total: 0, today: 0, byCategory: {}, recentUsers: [] };
  }
}

/**
 * Helper function to get relative time string
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return past.toLocaleDateString();
}

/**
 * Clear old audit logs (optional maintenance function)
 * @param {number} daysToKeep - Number of days of logs to retain (default: 90)
 * @returns {Promise<number>} Number of logs deleted
 */
export async function cleanupOldLogs(daysToKeep = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const oldLogs = await db.auditLogs
      .filter(log => new Date(log.timestamp) < cutoffDate)
      .toArray();
    
    const oldLogIds = oldLogs.map(log => log.id);
    await db.auditLogs.bulkDelete(oldLogIds);
    
    return oldLogIds.length;
  } catch (err) {
    console.error('Failed to cleanup old logs:', err);
    return 0;
  }
}
