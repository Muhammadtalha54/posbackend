/**
 * ============================================
 * Purchases Microservice — Service
 * ============================================
 * 
 * Business logic for purchase creation:
 * 1. Calculate totals from line items
 * 2. Create purchase + items in a DB transaction
 * 3. Increase product stock for each item
 * 4. Log every stock change to stock_logs
 * 
 * Mirror of sales logic, but stock goes UP.
 * ============================================
 */

const { v4: uuidv4 } = require('uuid');
const purchasesRepository = require('./purchases.repository');
const productsRepository = require('../products/products.repository');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');

const purchasesService = {
  /**
   * Create a new purchase with line items
   * Runs inside a PostgreSQL transaction
   */
  async create(userId, { id, supplier_name, items, paid_amount, due_amount, payment_status, payment_type, created_at }) {
    const client = await purchasesRepository.getClient();

    try {
      await client.query('BEGIN');

      const purchaseId = id || uuidv4();

      // Calculate totals
      let totalAmount = 0;
      const purchaseItems = [];

      for (const item of items) {
        const totalCost = item.unit_cost * item.quantity;
        totalAmount += totalCost;

        purchaseItems.push({
          id: uuidv4(),
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: totalCost,
        });
      }

      const finalPaid = paid_amount !== undefined ? paid_amount : totalAmount;
      const finalDue = due_amount !== undefined ? due_amount : Math.max(0, totalAmount - finalPaid);
      const finalStatus = payment_status || (finalDue <= 0 ? 'paid' : (finalPaid > 0 ? 'partial' : 'credit'));

      // 1. Create the purchase header
      const purchase = await purchasesRepository.createPurchase(
        client, purchaseId, userId, supplier_name, totalAmount, finalPaid, finalDue, finalStatus, payment_type || 'cash', created_at
      );

      // 2. Create each item + increase stock + log
      for (const item of purchaseItems) {
        await purchasesRepository.createPurchaseItem(
          client, item.id, purchaseId, item.product_id, item.quantity, item.unit_cost, item.total_cost
        );

        // Increase product stock
        const stockResult = await productsRepository.increaseStock(item.product_id, item.quantity, client);
        if (!stockResult) {
          throw new Error(`Product ${item.product_id} not found or deleted.`);
        }

        // Log the stock change (positive = increase)
        await purchasesRepository.createStockLog(
          client, uuidv4(), item.product_id, userId, 'purchase', item.quantity, purchaseId
        );
      }

      await client.query('COMMIT');

      return { ...purchase, items: purchaseItems };
    } catch (err) {
      await client.query('ROLLBACK');
      err.statusCode = err.statusCode || 400;
      throw err;
    } finally {
      client.release();
    }
  },

  /** List purchases with pagination */
  async list(userId, query) {
    const { page, limit, offset } = getPagination(query);
    const [purchases, total] = await Promise.all([
      purchasesRepository.findAllByUser(userId, limit, offset),
      purchasesRepository.countByUser(userId),
    ]);
    return {
      purchases,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async markAsPaid(userId, id) {
    const purchase = await purchasesRepository.markPurchaseAsPaid(id, userId);
    if (!purchase) {
      const err = new Error('Purchase not found or already paid');
      err.statusCode = 404;
      throw err;
    }
    return purchase;
  },
};

module.exports = purchasesService;
