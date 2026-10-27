/**
 * ============================================
 * Sync Microservice — Service
 * ============================================
 * 
 * Handles the offline-first sync logic:
 * 
 * UPLOAD: Desktop app sends batch of offline changes.
 *   - Each entity is upserted (no duplicates)
 *   - A sync_log entry is created for audit
 *   - Returns list of synced IDs
 * 
 * DOWNLOAD: Desktop app requests latest data.
 *   - Accepts ?last_sync_at timestamp
 *   - Returns all records updated after that time
 *   - Scoped to user_id only
 * ============================================
 */

const salesService = require('../sales/sales.service');
const purchasesService = require('../purchases/purchases.service');
const syncRepository = require('./sync.repository');

const syncService = {
  /**
   * Process a batch upload from the desktop app
   * Each entity is upserted based on its type
   */
  async upload(userId, { entities }) {
    const results = [];

    for (const entity of entities) {
      const { entity_type, client_id, data } = entity;

      // Check if already synced to be idempotent
      const existingLog = await syncRepository.getSyncLog(client_id);
      if (existingLog && existingLog.is_synced) {
        results.push({ client_id, entity_type, synced: true });
        continue;
      }

      let result;

      try {
        // Route to appropriate upsert based on entity type
        switch (entity_type) {
          case 'product':
            result = await syncRepository.upsertProduct(client_id, userId, data);
            break;
          case 'category':
            result = await syncRepository.upsertCategory(client_id, userId, data);
            break;
          case 'sale':
            // The sale payload must include the offline created_at if possible
            result = await salesService.create(userId, { id: client_id, ...data });
            break;
          case 'sale_paid':
            // Custom operation to mark sale as paid
            result = await salesService.markAsPaid(userId, data.sale_id);
            break;
          case 'purchase':
            result = await purchasesService.create(userId, { id: client_id, ...data });
            break;
          default:
            result = { id: client_id, entity_type, status: 'logged' };
            break;
        }

        // Log the sync operation
        await syncRepository.createSyncLog(client_id, userId, entity_type, data, true);

        results.push({ client_id, entity_type, synced: true });
      } catch (err) {
        console.error(`Error syncing ${entity_type} ${client_id}:`, err.message);
        results.push({ client_id, entity_type, synced: false, error: err.message });
      }
    }

    return { synced_count: results.length, results };
  },

  /**
   * Get all records updated since the last sync
   * Desktop app uses this to pull latest cloud data
   */
  async download(userId, lastSyncAt) {
    const data = await syncRepository.getUpdatedRecords(userId, lastSyncAt);

    return {
      ...data,
      server_time: new Date().toISOString(),
    };
  },
};

module.exports = syncService;
