/**
 * ============================================
 * Products Microservice — Service
 * ============================================
 */

const { v4: uuidv4 } = require('uuid');
const productsRepository = require('./products.repository');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');

const productsService = {
  /** Create a new product for the user's shop */
  async create(userId, data) {
    const id = uuidv4();
    return productsRepository.create(id, userId, data);
  },

  /** Update an existing product (user-scoped) */
  async update(userId, productId, data) {
    const product = await productsRepository.update(productId, userId, data);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }
    return product;
  },

  /** Soft-delete a product (user-scoped) */
  async delete(userId, productId) {
    const result = await productsRepository.softDelete(productId, userId);
    if (!result) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }
    return result;
  },

  /** List products with pagination (user-scoped) */
  async list(userId, query) {
    const { page, limit, offset } = getPagination(query);
    const [products, total] = await Promise.all([
      productsRepository.findAllByUser(userId, limit, offset),
      productsRepository.countByUser(userId),
    ]);
    return {
      products,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};

module.exports = productsService;
