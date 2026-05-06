/**
 * ============================================
 * Purchases Microservice — Repository
 * ============================================
 * 
 * Database queries for purchases and purchase_items.
 * Uses transactions to ensure atomic stock updates.
 * ============================================
 */

const pool = require('../../db/pool');

const purchasesRepository = {
  /** Get a client from pool for transactions */
  async getClient() {
    return pool.connect();
  },

  /** Create a purchase header */
  async createPurchase(client, id, userId, supplierName, totalAmount) {
    const query = `
      INSERT INTO purchases (id, user_id, supplier_name, total_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await client.query(query, [id, userId, supplierName, totalAmount]);
    return rows[0];
  },

  /** Create a purchase line item */
  async createPurchaseItem(client, id, purchaseId, productId, quantity, unitCost, totalCost) {
    const query = `
      INSERT INTO purchase_items (id, purchase_id, product_id, quantity, unit_cost, total_cost)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await client.query(query, [id, purchaseId, productId, quantity, unitCost, totalCost]);
    return rows[0];
  },

  /** Create a stock log entry */
  async createStockLog(client, id, productId, userId, changeType, quantityChange, referenceId) {
    const query = `
      INSERT INTO stock_logs (id, product_id, user_id, change_type, quantity_change, reference_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await client.query(query, [id, productId, userId, changeType, quantityChange, referenceId]);
  },

  /** List purchases (user-scoped, paginated) */
  async findAllByUser(userId, limit, offset) {
    const query = `
      SELECT p.*,
        json_agg(json_build_object(
          'id', pi.id,
          'product_id', pi.product_id,
          'quantity', pi.quantity,
          'unit_cost', pi.unit_cost,
          'total_cost', pi.total_cost
        )) AS items
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await pool.query(query, [userId, limit, offset]);
    return rows;
  },

  /** Count purchases for pagination */
  async countByUser(userId) {
    const query = `SELECT COUNT(*) FROM purchases WHERE user_id = $1`;
    const { rows } = await pool.query(query, [userId]);
    return parseInt(rows[0].count, 10);
  },
};

module.exports = purchasesRepository;
