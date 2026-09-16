/**
 * ============================================
 * Sales Microservice — Routes
 * ============================================
 * 
 * POST /sales/create → Create a sale (with items, stock update, logging)
 * GET  /sales/list   → List sales with items (paginated)
 * 
 * All routes require JWT authentication.
 * ============================================
 */

const { Router } = require('express');
const salesController = require('./sales.controller');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createSaleSchema } = require('./sales.validation');

const router = Router();

router.use(authMiddleware);

router.post('/create', validate(createSaleSchema), salesController.create);
router.get('/list', salesController.list);
router.patch('/:id/mark-paid', salesController.markPaid);

module.exports = router;
