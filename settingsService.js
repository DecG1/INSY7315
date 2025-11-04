// settingsService.js
// Purpose: Persist user preferences and application settings in IndexedDB.
// Settings include notification toggles, data retention policies, and other preferences.
import { db } from "./db.js";

/**
 * Default settings object
 */
const DEFAULT_SETTINGS = {
  // Notification preferences
  lowStockAlerts: true,
  expiryWarnings: true,
  
  // Data retention settings (in days, 0 = never delete)
  auditLogRetentionDays: 90,
  notificationRetentionDays: 30,
  
  // Display preferences (managed by contexts, included here for completeness)
  animations: true,
};

/**
 * Get all settings, with defaults for any missing values
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
  try {
    const settings = await db.settings.toArray();
    
    // Settings are stored as key-value pairs
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    // Merge with defaults for any missing keys
    return { ...DEFAULT_SETTINGS, ...settingsObj };
  } catch (err) {
    console.error("Failed to load settings:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Get a specific setting by key
 * @param {string} key - Setting key
 * @param {*} defaultValue - Default value if not found
 * @returns {Promise<*>} Setting value
 */
export async function getSetting(key, defaultValue = null) {
  try {
    const setting = await db.settings.get(key);
    return setting ? setting.value : (DEFAULT_SETTINGS[key] ?? defaultValue);
  } catch (err) {
    console.error(`Failed to load setting ${key}:`, err);
    return DEFAULT_SETTINGS[key] ?? defaultValue;
  }
}

/**
 * Update a single setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 */
export async function updateSetting(key, value) {
  try {
    await db.settings.put({ key, value });
  } catch (err) {
    console.error(`Failed to update setting ${key}:`, err);
    throw err;
  }
}

/**
 * Update multiple settings at once
 * @param {Object} settings - Object with key-value pairs to update
 */
export async function updateSettings(settings) {
  try {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));
    await db.settings.bulkPut(updates);
  } catch (err) {
    console.error("Failed to update settings:", err);
    throw err;
  }
}

/**
 * Reset all settings to defaults
 */
export async function resetSettings() {
  try {
    await db.settings.clear();
    await updateSettings(DEFAULT_SETTINGS);
  } catch (err) {
    console.error("Failed to reset settings:", err);
    throw err;
  }
}

/**
 * Clean up old audit logs based on retention settings
 * @returns {Promise<number>} Number of records deleted
 */
export async function cleanupAuditLogs() {
  try {
    const retentionDays = await getSetting('auditLogRetentionDays', 90);
    
    // If retention is 0, never delete
    if (retentionDays === 0) return 0;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    // Delete audit logs older than cutoff
    const oldLogs = await db.auditLogs
      .where('timestamp')
      .below(cutoffDate.getTime())
      .toArray();
    
    if (oldLogs.length > 0) {
      await db.auditLogs
        .where('timestamp')
        .below(cutoffDate.getTime())
        .delete();
    }
    
    return oldLogs.length;
  } catch (err) {
    console.error("Failed to cleanup audit logs:", err);
    return 0;
  }
}

/**
 * Clean up old notifications based on retention settings
 * @returns {Promise<number>} Number of records deleted
 */
export async function cleanupNotifications() {
  try {
    const retentionDays = await getSetting('notificationRetentionDays', 30);
    
    // If retention is 0, never delete
    if (retentionDays === 0) return 0;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTimestamp = cutoffDate.getTime();
    
    // Count notifications to delete
    const allNotifications = await db.notifications.toArray();
    const toDelete = allNotifications.filter(n => {
      // Parse timestamp from notification
      // Notifications might not have a numeric timestamp, handle gracefully
      if (!n.id) return false;
      
      // If notification has a timestamp property, use it
      if (n.timestamp) {
        const nTime = new Date(n.timestamp).getTime();
        return nTime < cutoffTimestamp;
      }
      
      // Otherwise, we can't determine age, so don't delete
      return false;
    });
    
    if (toDelete.length > 0) {
      const idsToDelete = toDelete.map(n => n.id);
      await db.notifications.bulkDelete(idsToDelete);
    }
    
    return toDelete.length;
  } catch (err) {
    console.error("Failed to cleanup notifications:", err);
    return 0;
  }
}

/**
 * Run all cleanup tasks based on retention settings
 * @returns {Promise<{auditLogs: number, notifications: number}>} Count of deleted records
 */
export async function runCleanupTasks() {
  const [auditLogs, notifications] = await Promise.all([
    cleanupAuditLogs(),
    cleanupNotifications(),
  ]);
  
  return { auditLogs, notifications };
}

/**
 * Check if low stock alerts are enabled
 * @returns {Promise<boolean>} True if low stock alerts should be shown
 */
export async function shouldShowLowStockAlerts() {
  return await getSetting('lowStockAlerts', true);
}

/**
 * Check if expiry warnings are enabled
 * @returns {Promise<boolean>} True if expiry warnings should be shown
 */
export async function shouldShowExpiryWarnings() {
  return await getSetting('expiryWarnings', true);
}

/**
 * Add a notification if the relevant setting is enabled
 * @param {string} type - Notification type ('lowStock' or 'expiry')
 * @param {Object} notification - Notification object to add
 */
export async function addNotificationIfEnabled(type, notification) {
  let enabled = true;
  
  if (type === 'lowStock') {
    enabled = await shouldShowLowStockAlerts();
  } else if (type === 'expiry') {
    enabled = await shouldShowExpiryWarnings();
  }
  
  if (enabled) {
    await db.notifications.add({
      ...notification,
      timestamp: Date.now(), // Add timestamp for retention cleanup
    });
  }
}
