/**
 * ============================================
 * Products Microservice — Routes
 * ============================================
 * 
 * POST   /products/create       → Create product
 * PUT    /products/update/:id   → Update product
 * DELETE /products/delete/:id   → Soft-delete product
 * GET    /products/list          → List products (paginated)
 * 
 * All routes require JWT authentication.
 * ============================================
 */

const { Router } = require('express');
const productsController = require('./products.controller');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createProductSchema, updateProductSchema, productIdParam } = require('./products.validation');

const router = Router();

// All product routes require authentication
router.use(authMiddleware);

router.post('/create', validate(createProductSchema), productsController.create);
router.put('/update/:id', validate(productIdParam, 'params'), validate(updateProductSchema), productsController.update);
router.delete('/delete/:id', validate(productIdParam, 'params'), productsController.delete);
router.get('/list', productsController.list);

module.exports = router;
