/**
 * ============================================
 * Server Entry Point
 * ============================================
 * 
 * Starts the HTTP server and connects to PostgreSQL.
 * This is the file that npm start/dev runs.
 * 
 * Separated from app.js so the Express app can
 * be imported independently for testing.
 * ============================================
 */

const app = require('./app');
const config = require('./config');
const pool = require('./db/pool');

// Catch any unhandled exceptions or rejections globally
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  try {
    // Verify database connection before starting
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully.');

    // Start HTTP server
    app.listen(config.port, () => {
      console.log(`\n🚀 POS Backend running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health: http://localhost:${config.port}/health`);
      console.log(`🔗 API:    http://localhost:${config.port}/api\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
