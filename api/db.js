/**
 * Pool de conexão PostgreSQL — Contaux API
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'contaux',
  user: process.env.DB_USER || 'contaux',
  password: process.env.DB_PASS || 'contaux123',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool PostgreSQL:', err.message);
});

/** Executa query com parâmetros */
async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

/** Executa múltiplas statements (para migrações) */
async function execMulti(text) {
  const client = await pool.connect();
  try {
    await client.query(text);
  } finally {
    client.release();
  }
}

module.exports = { pool, query, execMulti };
