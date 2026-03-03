// =============================================
// db.js — Database connection pool
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
// A pool reuses connections instead of creating a new one per query
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }
  release();
  console.log('✅ Database connected successfully');
});

// Helper function to run queries
// Usage: await query('SELECT * FROM users WHERE id = $1', [userId])
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`🗄️ Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
  return result;
}

module.exports = { pool, query };