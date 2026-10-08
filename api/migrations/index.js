/**
 * Runner de migrações — executa arquivos SQL em ordem
 */
const fs = require('fs');
const path = require('path');
const { execMulti, query } = require('../db');

const MIGRATIONS_DIR = path.join(__dirname);

async function runMigrations() {
  // Cria tabela de controle se não existir
  await execMulti(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const already = await query('SELECT 1 FROM _migrations WHERE filename = $1', [file]);
    if (already.rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`[migração] Executando ${file}...`);
    await execMulti(sql);
    await query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
    console.log(`[migração] ${file} concluída.`);
  }

  console.log('[migração] Todas as migrações estão em dia.');
}

module.exports = { runMigrations };
