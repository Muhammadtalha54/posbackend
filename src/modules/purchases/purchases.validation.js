/**
 * ============================================
 * Purchases Microservice — Validation Schemas
 * ============================================
 */

const { z } = require('zod');

// Each line item in a purchase
const purchaseItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_cost: z.number().int().min(0),
});

// POST /purchases/create
const createPurchaseSchema = z.object({
  supplier_name: z.string().min(1, 'Supplier name is required').max(200),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

module.exports = { createPurchaseSchema };
