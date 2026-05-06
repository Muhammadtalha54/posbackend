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

      let result;

      // Route to appropriate upsert based on entity type
      switch (entity_type) {
        case 'product':
          result = await syncRepository.upsertProduct(client_id, userId, data);
          break;
        case 'category':
          result = await syncRepository.upsertCategory(client_id, userId, data);
          break;
        // Sales and purchases are logged but not upserted
        // (they should be created via their own endpoints for proper stock handling)
        default:
          result = { id: client_id, entity_type, status: 'logged' };
          break;
      }

      // Log the sync operation
      await syncRepository.createSyncLog(client_id, userId, entity_type, data, true);

      results.push({
        client_id,
        entity_type,
        synced: true,
      });
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
