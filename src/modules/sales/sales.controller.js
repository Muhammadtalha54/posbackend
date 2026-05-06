/**
 * ============================================
 * Sales Microservice — Controller
 * ============================================
 */

const salesService = require('./sales.service');
const { sendSuccess } = require('../../utils/response');

const salesController = {
  /** POST /sales/create */
  async create(req, res, next) {
    try {
      const sale = await salesService.create(req.user.userId, req.body);
      return sendSuccess(res, 'Sale created.', sale, 201);
    } catch (err) {
      next(err);
    }
  },

  /** GET /sales/list */
  async list(req, res, next) {
    try {
      const result = await salesService.list(req.user.userId, req.query);
      return sendSuccess(res, 'Sales fetched.', result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = salesController;
