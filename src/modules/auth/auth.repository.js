/**
 * ============================================
 * Auth Microservice — Repository (Data Layer)
 * ============================================
 * 
 * All database queries related to authentication.
 * This is the ONLY layer that touches the database.
 * Controllers and services never write SQL directly.
 * ============================================
 */

const pool = require('../../db/pool');

const authRepository = {
  /**
   * Create a new user (shop account)
   * @param {string} id - UUID
   * @param {string} shopName
   * @param {string} email
   * @param {string} passwordHash
   * @returns {object} Created user row
   */
  async createUser(id, shopName, email, passwordHash) {
    const query = `
      INSERT INTO users (id, shop_name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, shop_name, email, created_at
    `;
    const { rows } = await pool.query(query, [id, shopName, email, passwordHash]);
    return rows[0];
  },

  /**
   * Find a user by email address
   * @param {string} email
   * @returns {object|null} User row or null
   */
  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  },

  /**
   * Store a password reset token with expiry
   * @param {string} email
   * @param {string} token - Random reset token
   * @param {Date} expires - Token expiry timestamp
   */
  async storeResetToken(email, token, expires) {
    const query = `
      UPDATE users 
      SET reset_token = $1, reset_token_expires = $2, updated_at = NOW()
      WHERE email = $3
    `;
    await pool.query(query, [token, expires, email]);
  },

  /**
   * Find a user by their reset token (only if not expired)
   * @param {string} token
   * @returns {object|null} User row or null
   */
  async findByResetToken(token) {
    const query = `
      SELECT * FROM users 
      WHERE reset_token = $1 AND reset_token_expires > NOW()
    `;
    const { rows } = await pool.query(query, [token]);
    return rows[0] || null;
  },

  /**
   * Update password and clear reset token
   * @param {string} userId
   * @param {string} newPasswordHash
   */
  async updatePassword(userId, newPasswordHash) {
    const query = `
      UPDATE users 
      SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(query, [newPasswordHash, userId]);
  },
};

module.exports = authRepository;
