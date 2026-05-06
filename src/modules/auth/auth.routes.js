/**
 * ============================================
 * Auth Microservice — Routes
 * ============================================
 * 
 * Defines all authentication HTTP endpoints.
 * Each route runs validation middleware first,
 * then passes to the controller.
 * 
 * POST /auth/signup          → Create account (public)
 * POST /auth/login           → Login (public)
 * POST /auth/forgot-password → Get reset token (public)
 * POST /auth/reset-password  → Reset password (public)
 * POST /auth/refresh-token   → Get fresh JWT (requires valid token)
 * ============================================
 */

const { Router } = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('./auth.validation');

const router = Router();

// Public routes (no token needed)
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected route (requires valid JWT to refresh)
router.post('/refresh-token', authMiddleware, authController.refreshToken);

module.exports = router;
