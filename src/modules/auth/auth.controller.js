/**
 * ============================================
 * Auth Microservice — Controller (HTTP Layer)
 * ============================================
 * 
 * Handles HTTP request/response for auth endpoints.
 * Controllers are thin — they extract data from the
 * request, call the service, and send the response.
 * No business logic lives here.
 * ============================================
 */

const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

const authController = {
  /**
   * POST /auth/signup
   * Create a new shop account
   */
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      return sendSuccess(res, 'Account created successfully.', result, 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/login
   * Authenticate and get JWT token
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, 'Login successful.', result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/forgot-password
   * Generate a password reset token
   */
  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body);
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/reset-password
   * Reset password using token
   */
  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      return sendSuccess(res, result.message);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/refresh-token
   * Get a fresh JWT token (requires current valid token)
   * Call this on app startup to keep session alive
   */
  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.user);
      return sendSuccess(res, 'Token refreshed.', result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
