/**
 * ============================================
 * JWT Token Utilities
 * ============================================
 * 
 * Handles token generation and verification.
 * Tokens contain { userId, email } in payload.
 * ============================================
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a signed JWT token
 * @param {object} payload - Data to encode (userId, email)
 * @returns {string} Signed JWT
 */
function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { generateToken, verifyToken };
