/**
 * ============================================
 * Categories Microservice — Controller
 * ============================================
 */

const categoriesService = require('./categories.service');
const { sendSuccess } = require('../../utils/response');

const categoriesController = {
  /** POST /categories/create */
  async create(req, res, next) {
    try {
      const category = await categoriesService.create(req.user.userId, req.body);
      return sendSuccess(res, 'Category created.', category, 201);
    } catch (err) {
      next(err);
    }
  },

  /** GET /categories/list */
  async list(req, res, next) {
    try {
      const categories = await categoriesService.list(req.user.userId);
      return sendSuccess(res, 'Categories fetched.', categories);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = categoriesController;
