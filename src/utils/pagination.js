/**
 * ============================================
 * Pagination Utility
 * ============================================
 * 
 * Extracts page/limit from query params and
 * returns SQL-ready offset/limit + metadata.
 * 
 * Usage:
 *   const { limit, offset, page } = getPagination(req.query);
 *   // Use in SQL: LIMIT $1 OFFSET $2
 * ============================================
 */

/**
 * Parse pagination from query parameters
 * @param {object} query - req.query object
 * @param {number} defaultLimit - Default items per page
 * @returns {{ page: number, limit: number, offset: number }}
 */
function getPagination(query, defaultLimit = 20) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build pagination metadata for response
 * @param {number} totalCount - Total records in DB
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {{ total: number, page: number, limit: number, totalPages: number }}
 */
function buildPaginationMeta(totalCount, page, limit) {
  return {
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
}

module.exports = { getPagination, buildPaginationMeta };
