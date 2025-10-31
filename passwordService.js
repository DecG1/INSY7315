// Password Service: Handle password hashing and validation
import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a random secure password
 * @param {number} length - Password length (default 12)
 * @returns {string} Generated password
 */
export function generatePassword(length = 12) {
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
 * @returns {object} Validation result with isValid and messages
 */
export function validatePasswordStrength(password) {
  const result = {
    isValid: true,
    messages: [],
  };

  if (password.length < 8) {
    result.isValid = false;
    result.messages.push('Password must be at least 8 characters long');
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase) {
    result.isValid = false;
    result.messages.push('Password must contain at least one uppercase letter');
  }

  if (!hasLowerCase) {
    result.isValid = false;
    result.messages.push('Password must contain at least one lowercase letter');
  }

  if (!hasNumber) {
    result.isValid = false;
    result.messages.push('Password must contain at least one number');
  }

  if (!hasSpecial) {
    result.isValid = false;
    result.messages.push('Password must contain at least one special character');
  }

  return result;
}
