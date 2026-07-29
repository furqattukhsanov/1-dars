const { Pool } = require('pg');

// ============ POSTGRESQL ============
// Bitta umumiy pool — barcha modullar shu yerdan oladi.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (e) => console.error('pg pool xatosi:', e.message));

module.exports = { pool };
