/**
 * ============================================
 * Products Microservice — Repository
 * ============================================
 * 
 * Direct PostgreSQL queries for products table:
 * - CRUD operations
 * - Stock increase/decrease
 * - Paginated listing scoped to user_id
 * ============================================
 */

const pool = require('../../db/pool');

const productsRepository = {
  /**
   * Create a new product scoped to a user
   */
  async create({ id, userId, name, categoryId, productCode, purchasePrice, salePrice, stock, lowStockThreshold }) {
    const query = `
      INSERT INTO products (id, user_id, name, category_id, product_code, purchase_price, sale_price, stock, low_stock_threshold)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      id, userId, name, categoryId || null, productCode || null,
      purchasePrice, salePrice, stock || 0, lowStockThreshold || 10,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Update product details dynamically based on provided fields
   */
  async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Dynamically build SET clause from updates object
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    // Always update the timestamp
    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE products SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} AND is_deleted = FALSE
      RETURNING *
    `;
    values.push(id, userId);

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  /**
   * Soft delete a product (set is_deleted = true)
   */
  async softDelete(id, userId) {
    const query = `
      UPDATE products SET is_deleted = TRUE, updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
      RETURNING id
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0] || null;
  },

  /**
   * List products with pagination (excludes soft-deleted)
   */
  async findAllByUser(userId, limit, offset) {
    const query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.user_id = $1 AND p.is_deleted = FALSE
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await pool.query(query, [userId, limit, offset]);
    return rows;
  },

  /**
   * Count total non-deleted products for pagination metadata
   */
  async countByUser(userId) {
    const query = `SELECT COUNT(*) FROM products WHERE user_id = $1 AND is_deleted = FALSE`;
    const { rows } = await pool.query(query, [userId]);
    return parseInt(rows[0].count, 10);
  },

  /**
   * Find a single product by ID + user scope
   */
  async findById(id, userId) {
    const query = `SELECT * FROM products WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0] || null;
  },

  /**
   * Decrease stock for a product (used during sales)
   * Clamped to minimum 0 to prevent negative stock
   */
  async decreaseStock(productId, quantity, client) {
    const query = `
      UPDATE products SET stock = GREATEST(0, stock - $1), updated_at = NOW()
      WHERE id = $2 AND is_deleted = FALSE
      RETURNING stock
    `;
    const db = client || pool;
    const { rows } = await db.query(query, [quantity, productId]);
    return rows[0];
  },

  /**
   * Increase stock for a product (used during purchases)
   */
  async increaseStock(productId, quantity, client) {
    const query = `
      UPDATE products SET stock = stock + $1, updated_at = NOW()
      WHERE id = $2 AND is_deleted = FALSE
      RETURNING stock
    `;
    const db = client || pool;
    const { rows } = await db.query(query, [quantity, productId]);
    return rows[0];
  },
};

module.exports = productsRepository;
