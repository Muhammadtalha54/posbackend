/**
 * ============================================
 * Password Hashing Utilities
 * ============================================
 * 
 * Wraps bcryptjs for hashing and comparing passwords.
 * Uses 12 salt rounds — good balance of security vs speed.
 * ============================================
 */

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password
 * @param {string} plainPassword
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare plaintext password against a hash
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} true if match
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
