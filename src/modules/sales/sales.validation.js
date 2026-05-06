/**
 * ============================================
 * Sales Microservice — Validation Schemas
 * ============================================
 */

const { z } = require('zod');

// Each line item in a sale
const saleItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().int().min(0),
});

// POST /sales/create
const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  discount: z.number().int().min(0).default(0),
  payment_type: z.enum(['cash', 'card', 'upi', 'credit']).default('cash'),
});

module.exports = { createSaleSchema };
