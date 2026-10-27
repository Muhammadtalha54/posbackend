/**
 * ============================================
 * Sales Microservice — Repository
 * ============================================
 * 
 * Database queries for sales and sale_items.
 * Uses PostgreSQL transactions to ensure atomicity:
 * sale creation + stock updates happen together or not at all.
 * ============================================
 */

const pool = require('../../db/pool');

const salesRepository = {
  /**
   * Get a client from the pool for transaction use
   */
  async getClient() {
    return pool.connect();
  },

  /**
   * Create a sale header record
   */
  async createSale(client, id, userId, totalAmount, discount, finalAmount, paymentType, customerName, paymentStatus, createdAt) {
    const query = `
      INSERT INTO sales (id, user_id, total_amount, discount, final_amount, payment_type, customer_name, payment_status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()), COALESCE($9, NOW()))
      RETURNING *
    `;
    const { rows } = await client.query(query, [
      id,
      userId,
      totalAmount,
      discount,
      finalAmount,
      paymentType,
      customerName || null,
      paymentStatus || 'paid',
      createdAt ? new Date(createdAt) : null,
    ]);
    return rows[0];
  },

  /**
   * Create a sale line item
   */
  async createSaleItem(client, id, saleId, productId, quantity, unitPrice, totalPrice) {
    const query = `
      INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total_price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await client.query(query, [id, saleId, productId, quantity, unitPrice, totalPrice]);
    return rows[0];
  },

  /**
   * Create a stock log entry for audit trail
   */
  async createStockLog(client, id, productId, userId, changeType, quantityChange, referenceId) {
    const query = `
      INSERT INTO stock_logs (id, product_id, user_id, change_type, quantity_change, reference_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await client.query(query, [id, productId, userId, changeType, quantityChange, referenceId]);
  },

  /**
   * List sales with pagination and optional date/search filters (user-scoped)
   */
  async findAllByUser(userId, limit, offset, { startDate, endDate, search, paymentStatus } = {}) {
    let whereClauses = ['s.user_id = $1'];
    let params = [userId];
    let paramIndex = 2;

    if (startDate) {
      whereClauses.push(`s.created_at >= $${paramIndex++}`);
      params.push(new Date(startDate));
    }
    if (endDate) {
      whereClauses.push(`s.created_at <= $${paramIndex++}`);
      params.push(new Date(endDate));
    }
    if (search) {
      whereClauses.push(`(s.customer_name ILIKE $${paramIndex} OR s.id::text ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (paymentStatus) {
      whereClauses.push(`s.payment_status = $${paramIndex++}`);
      params.push(paymentStatus);
    }

    const whereStr = whereClauses.join(' AND ');

    const query = `
      SELECT s.*, 
        json_agg(json_build_object(
          'id', si.id,
          'product_id', si.product_id,
          'quantity', si.quantity,
          'unit_price', si.unit_price,
          'total_price', si.total_price
        )) AS items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE ${whereStr}
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    return rows;
  },

  /**
   * Count total sales with filters
   */
  async countByUser(userId, { startDate, endDate, search, paymentStatus } = {}) {
    let whereClauses = ['user_id = $1'];
    let params = [userId];
    let paramIndex = 2;

    if (startDate) {
      whereClauses.push(`created_at >= $${paramIndex++}`);
      params.push(new Date(startDate));
    }
    if (endDate) {
      whereClauses.push(`created_at <= $${paramIndex++}`);
      params.push(new Date(endDate));
    }
    if (search) {
      whereClauses.push(`(customer_name ILIKE $${paramIndex} OR id::text ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (paymentStatus) {
      whereClauses.push(`payment_status = $${paramIndex++}`);
      params.push(paymentStatus);
    }

    const whereStr = whereClauses.join(' AND ');
    const query = `SELECT COUNT(*) FROM sales WHERE ${whereStr}`;
    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].count, 10);
  },

  /**
   * Mark a sale as paid
   */
  async markSaleAsPaid(id, userId) {
    const query = `
      UPDATE sales 
      SET payment_status = 'paid', updated_at = NOW() 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  },
};

module.exports = salesRepository;
