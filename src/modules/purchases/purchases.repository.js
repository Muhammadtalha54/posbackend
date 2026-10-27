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
  async createPurchase(client, id, userId, supplierName, totalAmount, paidAmount, dueAmount, paymentStatus, paymentType, createdAt) {
    const query = `
      INSERT INTO purchases (id, user_id, supplier_name, total_amount, paid_amount, due_amount, payment_status, payment_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()), COALESCE($9, NOW()))
      RETURNING *
    `;
    const { rows } = await client.query(query, [
      id,
      userId,
      supplierName,
      totalAmount,
      paidAmount ?? totalAmount,
      dueAmount ?? 0,
      paymentStatus || 'paid',
      paymentType || 'cash',
      createdAt ? new Date(createdAt) : null,
    ]);
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

  /** Count total purchases */
  async countByUser(userId) {
    const query = `SELECT COUNT(*) FROM purchases WHERE user_id = $1`;
    const { rows } = await pool.query(query, [userId]);
    return parseInt(rows[0].count, 10);
  },

  /** Mark a purchase invoice as paid (clears credit) */
  async markPurchaseAsPaid(id, userId) {
    const query = `
      UPDATE purchases
      SET payment_status = 'paid', paid_amount = total_amount, due_amount = 0, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  },
};

module.exports = purchasesRepository;
