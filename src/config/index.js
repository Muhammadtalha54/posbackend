/**
 * ============================================
 * Application Configuration
 * ============================================
 * 
 * Centralized configuration module. All environment
 * variables are loaded here and exported as a single
 * config object. This ensures:
 * 
 * 1. Single source of truth for all config values
 * 2. Default fallbacks for development
 * 3. Easy to validate required variables
 * 
 * Usage: const config = require('./config');
 * ============================================
 */

require('dotenv').config();

const config = {
  // --- Server ---
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // --- Database ---
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'pos_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // --- JWT ---
  jwt: {
    secret: process.env.JWT_SECRET || 'default-dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    // Allow refresh when token has less than 7 days left
    refreshWindowDays: parseInt(process.env.JWT_REFRESH_WINDOW_DAYS, 10) || 7,
  },

  // --- Password Reset ---
  resetTokenExpiryMinutes: parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES, 10) || 30,
};

module.exports = config;
