/**
 * ============================================
 * Products Microservice — Controller
 * ============================================
 */

const productsService = require('./products.service');
const { sendSuccess } = require('../../utils/response');

const productsController = {
  /** POST /products/create */
  async create(req, res, next) {
    try {
      const product = await productsService.create(req.user.userId, req.body);
      return sendSuccess(res, 'Product created.', product, 201);
    } catch (err) {
      next(err);
    }
  },

  /** PUT /products/update/:id */
  async update(req, res, next) {
    try {
      const product = await productsService.update(req.user.userId, req.params.id, req.body);
      return sendSuccess(res, 'Product updated.', product);
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /products/delete/:id */
  async delete(req, res, next) {
    try {
      await productsService.delete(req.user.userId, req.params.id);
      return sendSuccess(res, 'Product deleted.');
    } catch (err) {
      next(err);
    }
  },

  /** GET /products/list */
  async list(req, res, next) {
    try {
      const result = await productsService.list(req.user.userId, req.query);
      return sendSuccess(res, 'Products fetched.', result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = productsController;
