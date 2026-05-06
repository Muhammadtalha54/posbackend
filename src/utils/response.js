/**
 * ============================================
 * Standardized API Response Helpers
 * ============================================
 * 
 * Every API response in this system uses the format:
 *   { success: boolean, message: string, data: object }
 * 
 * These helpers enforce that format everywhere.
 * ============================================
 */

/**
 * Send a success response
 * @param {object} res - Express response
 * @param {string} message - Human-readable message
 * @param {object} data - Response payload
 * @param {number} statusCode - HTTP status (default 200)
 */
function sendSuccess(res, message, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error response
 * @param {object} res - Express response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status (default 400)
 * @param {array} errors - Optional validation error details
 */
function sendError(res, message, statusCode = 400, errors = null) {
  const response = {
    success: false,
    message,
  };

  // Attach field-level errors if provided (e.g., from validation)
  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

module.exports = { sendSuccess, sendError };
