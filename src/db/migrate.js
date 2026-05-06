/**
 * ============================================
 * Database Migration Runner
 * ============================================
 * 
 * Reads and executes SQL migration files in order.
 * Run with: npm run db:migrate
 * 
 * Migrations live in /src/db/migrations/ and are
 * executed alphabetically (prefix with 001_, 002_, etc.)
 * ============================================
 */

const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');

  try {
    // Read all .sql files sorted alphabetically
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found.');
      return;
    }

    console.log(`📦 Running ${files.length} migration(s)...\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`  ▶ Running: ${file}`);
      await pool.query(sql);
      console.log(`  ✅ Done: ${file}`);
    }

    console.log('\n🎉 All migrations completed successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
