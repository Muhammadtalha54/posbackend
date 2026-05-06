/**
 * ============================================
 * Centralized Error Handler Middleware
 * ============================================
 * 
 * Catches all unhandled errors thrown in routes
 * or middleware. Formats them into a consistent
 * API response and hides stack traces in production.
 * 
 * Must be registered LAST in Express middleware chain.
 * ============================================
 */

const config = require('../config');

function errorHandler(err, req, res, next) {
  // Log full error in development for debugging
  if (!config.isProduction) {
    console.error('🔥 Error:', err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
