/**
 * ============================================
 * PostgreSQL Connection Pool
 * ============================================
 * 
 * Creates a reusable connection pool to PostgreSQL.
 * All database queries across the app use this pool.
 * 
 * Why a pool?
 * - Reuses connections (no overhead per query)
 * - Handles concurrent requests efficiently
 * - Auto-manages connection lifecycle
 * ============================================
 */

const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  // Max connections in pool — tune based on server capacity
  max: 20,
  // Close idle connections after 30 seconds
  idleTimeoutMillis: 30000,
  // Timeout if a connection can't be established in 15 seconds
  connectionTimeoutMillis: 15000,
  ssl: config.db.host.includes('supabase') || config.isProduction ? { rejectUnauthorized: false } : false,
});

// Log pool errors globally so they don't crash the app silently
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

module.exports = pool;
