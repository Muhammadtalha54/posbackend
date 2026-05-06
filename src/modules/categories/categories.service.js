/**
 * ============================================
 * Categories Microservice — Service
 * ============================================
 */

const { v4: uuidv4 } = require('uuid');
const categoriesRepository = require('./categories.repository');

const categoriesService = {
  /** Create a new category for the authenticated user's shop */
  async create(userId, { name }) {
    const id = uuidv4();
    return categoriesRepository.create(id, userId, name);
  },

  /** List all categories for the authenticated user's shop */
  async list(userId) {
    return categoriesRepository.findAllByUser(userId);
  },
};

module.exports = categoriesService;
