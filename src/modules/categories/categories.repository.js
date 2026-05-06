/**
 * ============================================
 * Categories Microservice — Repository
 * ============================================
 * 
 * Database queries for product categories.
 * Categories are scoped per user (shop).
 * ============================================
 */

const pool = require('../../db/pool');

const categoriesRepository = {
  /**
   * Create a new category for a shop
   */
  async create(id, userId, name) {
    const query = `
      INSERT INTO categories (id, user_id, name)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, userId, name]);
    return rows[0];
  },

  /**
   * Get all categories for a user (shop)
   */
  async findAllByUser(userId) {
    const query = `
      SELECT * FROM categories 
      WHERE user_id = $1 
      ORDER BY name ASC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  /**
   * Find a single category by ID + user scope
   */
  async findById(id, userId) {
    const query = `SELECT * FROM categories WHERE id = $1 AND user_id = $2`;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0] || null;
  },
};

module.exports = categoriesRepository;
