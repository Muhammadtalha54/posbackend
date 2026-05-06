/**
 * ============================================
 * Route Aggregator — API Gateway
 * ============================================
 * 
 * Central hub that mounts all microservice routes
 * under their respective URL prefixes. Each module
 * is fully self-contained — this file just wires
 * them together.
 * 
 * Adding a new microservice? Just add one line here.
 * ============================================
 */

const { Router } = require('express');

// Import all microservice route modules
const authRoutes = require('../modules/auth/auth.routes');
const categoriesRoutes = require('../modules/categories/categories.routes');
const productsRoutes = require('../modules/products/products.routes');
const salesRoutes = require('../modules/sales/sales.routes');
const purchasesRoutes = require('../modules/purchases/purchases.routes');
const syncRoutes = require('../modules/sync/sync.routes');

const router = Router();

// Mount each microservice at its URL prefix
router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/sales', salesRoutes);
router.use('/purchases', purchasesRoutes);
router.use('/sync', syncRoutes);

module.exports = router;
