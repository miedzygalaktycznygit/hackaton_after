const { pool } = require('./src/db/db_config');

async function test() {
  try {
    const res = await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('SUCCESS: pgvector extension is available and created!', res);
  } catch (err) {
    console.log('FAILED: pgvector is NOT available:', err.message);
  } finally {
    await pool.end();
  }
}

test();
