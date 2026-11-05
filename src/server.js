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
  // Start HTTP server immediately so Render proxy and health checks succeed right away
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`\n🚀 POS Backend running on 0.0.0.0:${config.port}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health: http://0.0.0.0:${config.port}/health`);
    console.log(`🔗 API:    http://0.0.0.0:${config.port}/api\n`);
  });

  // Verify database connection asynchronously
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully.');
  } catch (err) {
    console.error('⚠️ Database connection warning:', err.message);
  }
}

startServer();
