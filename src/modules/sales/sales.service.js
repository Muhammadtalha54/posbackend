/**
 * ============================================
 * Sales Microservice — Service
 * ============================================
 * 
 * Core business logic for sales:
 * 1. Calculate totals from line items
 * 2. Create sale + sale_items in a DB transaction
 * 3. Decrease product stock for each item
 * 4. Log every stock change to stock_logs
 * 
 * If ANY step fails, the entire transaction rolls back.
 * ============================================
 */

const { v4: uuidv4 } = require('uuid');
const salesRepository = require('./sales.repository');
const productsRepository = require('../products/products.repository');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');

const salesService = {
  /**
   * Create a new sale with line items
   * Runs inside a PostgreSQL transaction for atomicity
   */
  async create(userId, { items, discount, payment_type }) {
    const client = await salesRepository.getClient();

    try {
      await client.query('BEGIN');

      const saleId = uuidv4();

      // Calculate total from all line items
      let totalAmount = 0;
      const saleItems = [];

      for (const item of items) {
        const totalPrice = item.unit_price * item.quantity;
        totalAmount += totalPrice;

        saleItems.push({
          id: uuidv4(),
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: totalPrice,
        });
      }

      // Apply discount
      const finalAmount = totalAmount - (discount || 0);

      // 1. Create the sale header
      const sale = await salesRepository.createSale(
        client, saleId, userId, totalAmount, discount || 0, finalAmount, payment_type
      );

      // 2. Create each sale item + update stock + log stock change
      for (const item of saleItems) {
        // Insert sale item
        await salesRepository.createSaleItem(
          client, item.id, saleId, item.product_id, item.quantity, item.unit_price, item.total_price
        );

        // Decrease product stock
        const stockResult = await productsRepository.decreaseStock(item.product_id, item.quantity, client);
        if (!stockResult) {
          throw new Error(`Product ${item.product_id} not found or deleted.`);
        }
        if (stockResult.stock < 0) {
          throw new Error(`Insufficient stock for product ${item.product_id}.`);
        }

        // Log the stock change (negative = decrease)
        await salesRepository.createStockLog(
          client, uuidv4(), item.product_id, userId, 'sale', -item.quantity, saleId
        );
      }

      await client.query('COMMIT');

      return { ...sale, items: saleItems };
    } catch (err) {
      await client.query('ROLLBACK');
      err.statusCode = err.statusCode || 400;
      throw err;
    } finally {
      client.release();
    }
  },

  /** List sales with pagination */
  async list(userId, query) {
    const { page, limit, offset } = getPagination(query);
    const [sales, total] = await Promise.all([
      salesRepository.findAllByUser(userId, limit, offset),
      salesRepository.countByUser(userId),
    ]);
    return {
      sales,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};

module.exports = salesService;
