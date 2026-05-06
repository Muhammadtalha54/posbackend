/**
 * ============================================
 * Products Microservice — Validation Schemas
 * ============================================
 */

const { z } = require('zod');

// POST /products/create
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  category_id: z.string().uuid().optional().nullable(),
  purchase_price: z.number().int().min(0, 'Purchase price must be >= 0'),
  sale_price: z.number().int().min(0, 'Sale price must be >= 0'),
  stock: z.number().int().min(0).default(0),
  product_code: z.string().max(50).optional().nullable(),
});

// PUT /products/update/:id
const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category_id: z.string().uuid().optional().nullable(),
  purchase_price: z.number().int().min(0).optional(),
  sale_price: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  product_code: z.string().max(50).optional().nullable(),
});

// Route params
const productIdParam = z.object({
  id: z.string().uuid('Invalid product ID'),
});

module.exports = { createProductSchema, updateProductSchema, productIdParam };
