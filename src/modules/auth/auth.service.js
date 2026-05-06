/**
 * ============================================
 * Auth Microservice — Service (Business Logic)
 * ============================================
 * 
 * Contains all authentication business logic:
 * - Signup: validate uniqueness, hash password, generate token
 * - Login: verify credentials, generate token
 * - Forgot Password: generate reset token
 * - Reset Password: verify token, update password
 * 
 * This layer orchestrates between the repository
 * and utility functions. Controllers only call services.
 * ============================================
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const authRepository = require('./auth.repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');
const config = require('../../config');

const authService = {
  /**
   * Register a new shop account
   * - Checks email uniqueness
   * - Hashes password
   * - Creates user record
   * - Returns JWT token + user profile
   */
  async signup({ shop_name, email, password }) {
    // Check if email already exists
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      const error = new Error('Email already registered.');
      error.statusCode = 409;
      throw error;
    }

    // Hash the password with bcrypt (12 salt rounds)
    const passwordHash = await hashPassword(password);
    const userId = uuidv4();

    // Create user in database
    const user = await authRepository.createUser(userId, shop_name, email, passwordHash);

    // Generate JWT with user ID and email
    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
  },

  /**
   * Authenticate an existing user
   * - Verifies email exists
   * - Compares password hash
   * - Returns JWT token + user profile
   */
  async login({ email, password }) {
    // Find user by email
    const user = await authRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Compare provided password against stored hash
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT
    const token = generateToken({ userId: user.id, email: user.email });

    // Return user profile without sensitive fields
    const profile = {
      id: user.id,
      shop_name: user.shop_name,
      email: user.email,
      created_at: user.created_at,
    };

    return { user: profile, token };
  },

  /**
   * Generate a password reset token
   * - Creates a random hex token
   * - Stores it in DB with expiry
   * - In production, this would send an email
   */
  async forgotPassword({ email }) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return { message: 'If that email exists, a reset token has been sent.' };
    }

    // Generate a cryptographically secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + config.resetTokenExpiryMinutes * 60 * 1000);

    // Store token in database
    await authRepository.storeResetToken(email, resetToken, expires);

    // In production: send email with reset link
    // For now: return token directly (for testing / desktop app use)
    return {
      message: 'Reset token generated.',
      reset_token: resetToken,
    };
  },

  /**
   * Reset password using a valid token
   * - Verifies token exists and hasn't expired
   * - Hashes new password
   * - Updates password and clears token
   */
  async resetPassword({ token, new_password }) {
    // Find user with this valid (non-expired) token
    const user = await authRepository.findByResetToken(token);
    if (!user) {
      const error = new Error('Invalid or expired reset token.');
      error.statusCode = 400;
      throw error;
    }

    // Hash the new password and update
    const newHash = await hashPassword(new_password);
    await authRepository.updatePassword(user.id, newHash);

    return { message: 'Password reset successful.' };
  },

  /**
   * Refresh an existing JWT token
   * - Only works if the token is still valid
   * - Issues a brand new token with a fresh 30-day expiry
   * - Frontend should call this periodically (e.g., on app open)
   *   to keep the session alive without forcing re-login
   */
  async refreshToken(currentUser) {
    // currentUser comes from the auth middleware (decoded JWT)
    // It's already verified, so just issue a new token
    const user = await authRepository.findByEmail(currentUser.email);
    if (!user) {
      const error = new Error('User no longer exists.');
      error.statusCode = 401;
      throw error;
    }

    // Generate a fresh token with new 30-day expiry
    const token = generateToken({ userId: user.id, email: user.email });

    const profile = {
      id: user.id,
      shop_name: user.shop_name,
      email: user.email,
      created_at: user.created_at,
    };

    return { user: profile, token };
  },
};

module.exports = authService;
