/**
 * ============================================
 * Sync Microservice — Controller
 * ============================================
 */

const syncService = require('./sync.service');
const { sendSuccess } = require('../../utils/response');

const syncController = {
  /** POST /sync/upload — Receive batch of offline data */
  async upload(req, res, next) {
    try {
      const result = await syncService.upload(req.user.userId, req.body);
      return sendSuccess(res, 'Sync upload complete.', result);
    } catch (err) {
      next(err);
    }
  },

  /** GET /sync/download — Send latest updates for offline DB */
  async download(req, res, next) {
    try {
      const lastSyncAt = req.query.last_sync_at || null;
      const result = await syncService.download(req.user.userId, lastSyncAt);
      return sendSuccess(res, 'Sync download complete.', result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = syncController;
