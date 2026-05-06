/**
 * ============================================
 * Sync Microservice — Repository
 * ============================================
 * 
 * Handles sync_logs table and provides queries
 * to fetch updated records across all entities
 * for the download endpoint.
 * ============================================
 */

const pool = require('../../db/pool');

const syncRepository = {
  /**
   * Create a sync log entry
   * Uses ON CONFLICT to prevent duplicate syncs (idempotent)
   */
  async createSyncLog(id, userId, entityType, payload, isSynced = true) {
    const query = `
      INSERT INTO sync_logs (id, user_id, entity_type, payload, is_synced)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET is_synced = $5
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, userId, entityType, JSON.stringify(payload), isSynced]);
    return rows[0];
  },

  /**
   * Upsert a product (INSERT or UPDATE on conflict)
   * Used during sync upload to handle offline-created data
   */
  async upsertProduct(id, userId, data) {
    const query = `
      INSERT INTO products (id, user_id, name, category_id, purchase_price, sale_price, stock, product_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category_id = EXCLUDED.category_id,
        purchase_price = EXCLUDED.purchase_price,
        sale_price = EXCLUDED.sale_price,
        stock = EXCLUDED.stock,
        product_code = EXCLUDED.product_code,
        updated_at = NOW()
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      id, userId, data.name, data.category_id || null,
      data.purchase_price || 0, data.sale_price || 0,
      data.stock || 0, data.product_code || null,
    ]);
    return rows[0];
  },

  /**
   * Upsert a category
   */
  async upsertCategory(id, userId, data) {
    const query = `
      INSERT INTO categories (id, user_id, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, userId, data.name]);
    return rows[0];
  },

  /**
   * Get all records updated after a given timestamp (for download)
   * Returns data across all entity types for the user
   */
  async getUpdatedRecords(userId, lastSyncAt) {
    const timestamp = lastSyncAt || '1970-01-01T00:00:00Z';

    // Fetch updated products
    const productsQuery = `
      SELECT * FROM products 
      WHERE user_id = $1 AND updated_at > $2
      ORDER BY updated_at ASC
    `;
    const products = await pool.query(productsQuery, [userId, timestamp]);

    // Fetch updated categories
    const categoriesQuery = `
      SELECT * FROM categories 
      WHERE user_id = $1 AND updated_at > $2
      ORDER BY updated_at ASC
    `;
    const categories = await pool.query(categoriesQuery, [userId, timestamp]);

    // Fetch updated sales with items
    const salesQuery = `
      SELECT s.*,
        json_agg(json_build_object(
          'id', si.id, 'product_id', si.product_id,
          'quantity', si.quantity, 'unit_price', si.unit_price,
          'total_price', si.total_price
        )) AS items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.user_id = $1 AND s.updated_at > $2
      GROUP BY s.id
      ORDER BY s.updated_at ASC
    `;
    const sales = await pool.query(salesQuery, [userId, timestamp]);

    // Fetch updated purchases with items
    const purchasesQuery = `
      SELECT p.*,
        json_agg(json_build_object(
          'id', pi.id, 'product_id', pi.product_id,
          'quantity', pi.quantity, 'unit_cost', pi.unit_cost,
          'total_cost', pi.total_cost
        )) AS items
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
      WHERE p.user_id = $1 AND p.updated_at > $2
      GROUP BY p.id
      ORDER BY p.updated_at ASC
    `;
    const purchases = await pool.query(purchasesQuery, [userId, timestamp]);

    return {
      products: products.rows,
      categories: categories.rows,
      sales: sales.rows,
      purchases: purchases.rows,
    };
  },
};

module.exports = syncRepository;
