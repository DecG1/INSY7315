// Password Service: Secure password hashing and verification using bcryptjs
import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password
 * @param {string} plainPassword - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
export async function hashPassword(plainPassword) {
  const saltRounds = 10; // Cost factor for bcrypt
  return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * Verify a plain text password against a stored hash
 * @param {string} plainPassword - The plain text password to verify
 * @param {string} passwordHash - The stored password hash
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
export async function verifyPassword(plainPassword, passwordHash) {
  return await bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Generate a random password (for initial user setup or password reset)
 * @param {number} length - Length of password (default: 12)
 * @returns {string} Random password
 */
export function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Object with {valid: boolean, message: string}
 */
export function validatePasswordStrength(password) {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (password.length < 8) {
    return { valid: true, message: 'Password is acceptable but could be stronger (8+ characters recommended)' };
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (strength >= 3) {
    return { valid: true, message: 'Strong password' };
  } else if (strength >= 2) {
    return { valid: true, message: 'Password is acceptable' };
  } else {
    return { valid: false, message: 'Password should include a mix of uppercase, lowercase, numbers, and symbols' };
  }
}
