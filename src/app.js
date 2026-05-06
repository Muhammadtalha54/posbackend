/**
 * ============================================
 * Express Application Setup
 * ============================================
 * 
 * Configures the Express app with:
 * - JSON body parsing
 * - CORS for cross-origin desktop app requests
 * - API routes under /api prefix
 * - Health check endpoint
 * - Centralized error handling
 * 
 * This file does NOT start the server — that's
 * server.js's job. This separation makes testing easier.
 * ============================================
 */

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ─── Global Middleware ────────────────────────────────────
// Parse JSON request bodies (limit 10mb for sync payloads)
app.use(express.json({ limit: '10mb' }));

// Enable CORS for desktop app and any frontend
app.use(cors());

// ─── Health Check ─────────────────────────────────────────
// Quick endpoint to verify server is running
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'POS Backend is running.',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────
// All API routes are prefixed with /api
app.use('/api', routes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Error Handler (must be LAST) ─────────────────────────
app.use(errorHandler);

module.exports = app;
