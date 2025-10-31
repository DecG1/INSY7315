// User Service: Manage user accounts with secure password authentication
import { db } from './db.js';
import { hashPassword, verifyPassword } from './passwordService.js';

/**
 * Initialize default users in the database if they don't exist
 * This should be called on app startup
 */
export async function initializeDefaultUsers() {
  const existingUsers = await db.users.count();
  
  // Only create default users if database is empty
  if (existingUsers === 0) {
    const defaultUsers = [
      {
        email: 'owner@marios.com',
        password: 'Owner@123', // Change this in production!
        role: 'Admin'
      },
      {
        email: 'assistantmanager@marios.com',
        password: 'Manager@123', // Change this in production!
        role: 'Manager'
      },
      {
        email: 'waiter@marios.com',
        password: 'Staff@123', // Change this in production!
        role: 'Staff'
      }
    ];
    
    for (const user of defaultUsers) {
      await createUser(user.email, user.password, user.role);
    }
    
    console.log('✅ Default users initialized. IMPORTANT: Change default passwords!');
    return true;
  }
  
  return false;
}

/**
 * Create a new user with hashed password
 * @param {string} email - User email (unique identifier)
 * @param {string} plainPassword - Plain text password
 * @param {string} role - User role (Admin, Manager, Staff)
 * @returns {Promise<number>} User ID
 */
export async function createUser(email, plainPassword, role) {
  const normalized = email.trim().toLowerCase();
  
  // Check if user already exists
  const existing = await db.users.where('email').equals(normalized).first();
  if (existing) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const passwordHash = await hashPassword(plainPassword);
  
  // Create user record
  const userId = await db.users.add({
    email: normalized,
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  });
  
  return userId;
}

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} plainPassword - Plain text password
 * @returns {Promise<object|null>} User object (without password hash) or null if auth fails
 */
export async function authenticateUser(email, plainPassword) {
  const normalized = email.trim().toLowerCase();
  
  // Find user by email
  const user = await db.users.where('email').equals(normalized).first();
  
  if (!user) {
    return null; // User not found
  }
  
  // Verify password
  const isValid = await verifyPassword(plainPassword, user.passwordHash);
  
  if (!isValid) {
    return null; // Invalid password
  }
  
  // Return user without password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get all users (without password hashes)
 * @returns {Promise<Array>} Array of user objects
 */
export async function getAllUsers() {
  const users = await db.users.toArray();
  return users.map(({ passwordHash, ...user }) => user);
}

/**
 * Update user password
 * @param {number} userId - User ID
 * @param {string} newPassword - New plain text password
 * @returns {Promise<void>}
 */
export async function updateUserPassword(userId, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  await db.users.update(userId, { passwordHash });
}

/**
 * Update user role
 * @param {number} userId - User ID
 * @param {string} newRole - New role (Admin, Manager, Staff)
 * @returns {Promise<void>}
 */
export async function updateUserRole(userId, newRole) {
  await db.users.update(userId, { role: newRole });
}

/**
 * Delete a user
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  await db.users.delete(userId);
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<object|null>} User object (without password hash) or null
 */
export async function getUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  const user = await db.users.where('email').equals(normalized).first();
  
  if (!user) {
    return null;
  }
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
