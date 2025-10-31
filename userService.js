// User Service: Manage users with password authentication
import { db } from './db.js';
import { hashPassword, verifyPassword } from './passwordService.js';

/**
 * Create a new user
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @param {string} role - User role (admin, manager, staff)
 * @returns {Promise<number>} User ID
 */
export async function createUser(email, password, role = 'staff') {
  const passwordHash = await hashPassword(password);
  const user = {
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  return db.users.add(user);
}

/**
 * Authenticate a user with email and password
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<object|null>} User object (without password) or null if authentication fails
 */
export async function authenticateUser(email, password) {
  const user = await db.users.where('email').equals(email.toLowerCase().trim()).first();
  
  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }

  // Return user without password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get all users (without passwords)
 * @returns {Promise<Array>} Array of users
 */
export async function getAllUsers() {
  const users = await db.users.toArray();
  return users.map(({ passwordHash, ...user }) => user);
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} User object (without password) or null
 */
export async function getUserById(userId) {
  const user = await db.users.get(userId);
  if (!user) return null;
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<object|null>} User object (without password) or null
 */
export async function getUserByEmail(email) {
  const user = await db.users.where('email').equals(email.toLowerCase().trim()).first();
  if (!user) return null;
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Update user role
 * @param {number} userId - User ID
 * @param {string} newRole - New role
 * @returns {Promise<number>} Number of updated records
 */
export async function updateUserRole(userId, newRole) {
  return db.users.update(userId, { role: newRole });
}

/**
 * Update user password
 * @param {number} userId - User ID
 * @param {string} newPassword - New plain text password
 * @returns {Promise<number>} Number of updated records
 */
export async function updateUserPassword(userId, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  return db.users.update(userId, { passwordHash });
}

/**
 * Delete user
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  return db.users.delete(userId);
}

/**
 * Initialize default users (if no users exist)
 * Creates admin and manager accounts
 */
export async function initializeDefaultUsers() {
  const userCount = await db.users.count();
  
  if (userCount === 0) {
    // Create default admin
    await createUser('admin@restaurant.com', 'Admin123!', 'admin');
    // Create default manager
    await createUser('manager@restaurant.com', 'Manager123!', 'manager');
    
    console.log('Default users created');
  }
}

/**
 * Check if email already exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
export async function emailExists(email) {
  const user = await db.users.where('email').equals(email.toLowerCase().trim()).first();
  return !!user;
}
