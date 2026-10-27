/**
 * ============================================
 * Purchases Microservice — Routes
 * ============================================
 * 
 * POST /purchases/create         → Create purchase (with items, stock update)
 * GET  /purchases/list           → List purchases (paginated)
 * PATCH /purchases/:id/mark-paid → Mark credit purchase as fully paid
 * 
 * All routes require JWT authentication.
 * ============================================
 */

const { Router } = require('express');
const purchasesController = require('./purchases.controller');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createPurchaseSchema } = require('./purchases.validation');

const router = Router();

router.use(authMiddleware);

router.post('/create', validate(createPurchaseSchema), purchasesController.create);
router.get('/list', purchasesController.list);
router.patch('/:id/mark-paid', purchasesController.markPaid);

module.exports = router;
