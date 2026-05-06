/**
 * ============================================
 * Sync Microservice — Validation Schemas
 * ============================================
 */

const { z } = require('zod');

// Each entity in a sync upload batch
const syncEntitySchema = z.object({
  entity_type: z.enum(['product', 'sale', 'purchase', 'category']),
  // Client-generated UUID to prevent duplicates (idempotent)
  client_id: z.string().uuid('Invalid client ID'),
  data: z.record(z.any()),
});

// POST /sync/upload
const syncUploadSchema = z.object({
  entities: z.array(syncEntitySchema).min(1, 'At least one entity is required'),
});

module.exports = { syncUploadSchema };
