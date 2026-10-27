/**
 * ============================================
 * Purchases Microservice — Controller
 * ============================================
 */

const purchasesService = require('./purchases.service');
const { sendSuccess } = require('../../utils/response');

const purchasesController = {
  /** POST /purchases/create */
  async create(req, res, next) {
    try {
      const purchase = await purchasesService.create(req.user.userId, req.body);
      return sendSuccess(res, 'Purchase created.', purchase, 201);
    } catch (err) {
      next(err);
    }
  },

  /** GET /purchases/list */
  async list(req, res, next) {
    try {
      const result = await purchasesService.list(req.user.userId, req.query);
      return sendSuccess(res, 'Purchases fetched.', result);
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /purchases/:id/mark-paid */
  async markPaid(req, res, next) {
    try {
      const purchase = await purchasesService.markAsPaid(req.user.userId, req.params.id);
      return sendSuccess(res, 'Purchase marked as paid.', purchase);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = purchasesController;
