/**
 * ============================================
 * Categories Microservice — Validation Schemas
 * ============================================
 */

const { z } = require('zod');

// POST /categories/create
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
});

module.exports = { createCategorySchema };
