/**
 * ============================================
 * Sync Microservice — Routes
 * ============================================
 * 
 * POST /sync/upload    → Upload batch of offline data
 * GET  /sync/download  → Download updates since last sync
 * 
 * All routes require JWT authentication.
 * Query: ?last_sync_at=2024-01-01T00:00:00Z
 * ============================================
 */

const { Router } = require('express');
const syncController = require('./sync.controller');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { syncUploadSchema } = require('./sync.validation');

const router = Router();

router.use(authMiddleware);

router.post('/upload', validate(syncUploadSchema), syncController.upload);
router.get('/download', syncController.download);

module.exports = router;
