/**
 * ============================================
 * Auth Microservice — Validation Schemas
 * ============================================
 * 
 * Zod schemas for all auth endpoints.
 * Validates request bodies before they reach
 * the controller. Keeps validation logic
 * isolated within this microservice.
 * ============================================
 */

const { z } = require('zod');

// POST /auth/signup
const signupSchema = z.object({
  shop_name: z.string().min(2, 'Shop name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

// POST /auth/login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /auth/forgot-password
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// POST /auth/reset-password
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  new_password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
