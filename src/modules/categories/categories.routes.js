/**
 * ============================================
 * Categories Microservice — Routes
 * ============================================
 * 
 * POST /categories/create  → Create a new category
 * GET  /categories/list     → List all categories
 * 
 * All routes are protected (require JWT auth).
 * ============================================
 */

const { Router } = require('express');
const categoriesController = require('./categories.controller');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createCategorySchema } = require('./categories.validation');

const router = Router();

// All category routes require authentication
router.use(authMiddleware);

router.post('/create', validate(createCategorySchema), categoriesController.create);
router.get('/list', categoriesController.list);

module.exports = router;
