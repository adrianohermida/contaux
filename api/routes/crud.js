/**
 * Fábrica de rotas CRUD genéricas para uma tabela PostgreSQL.
 * Gera: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
 *
 * @param {string} table - Nome da tabela
 * @param {object} opts - { jsonbFields: [campos], searchFields: [campos] }
 */
function createCrudRouter(table, opts = {}) {
  const express = require('express');
  const router = express.Router();
  const { query } = require('../db');

  const jsonbFields = new Set(opts.jsonbFields || []);
  const searchFields = opts.searchFields || ['name', 'client_name'];

  // Palavras reservadas do PostgreSQL que precisam de aspas
  const reserved = new Set(['user', 'from', 'to', 'order', 'group', 'select', 'where', 'limit']);

  /** Coloca aspas duplas no nome da coluna se for palavra reservada */
  function col(name) {
    return reserved.has(name) ? `"${name}"` : name;
  }

  // Listar (com busca opcional via ?q=)
  router.get('/', async (req, res) => {
    try {
      const { q } = req.query;
      let sql = `SELECT * FROM ${table} ORDER BY id DESC`;
      let params = [];

      if (q && searchFields.length) {
        const conditions = searchFields
          .map((f, i) => `${col(f)} ILIKE $${i + 1}`)
          .join(' OR ');
        sql = `SELECT * FROM ${table} WHERE ${conditions} ORDER BY id DESC`;
        params = searchFields.map(() => `%${q}%`);
      }

      const result = await query(sql, params);
      const rows = result.rows.map(parseRow);
      res.json(rows);
    } catch (err) {
      console.error(`[${table}] Erro ao listar:`, err.message);
      res.status(500).json({ error: 'Erro ao buscar registros' });
    }
  });

  // Buscar por ID
  router.get('/:id', async (req, res) => {
    try {
      const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Registro não encontrado' });
      res.json(parseRow(result.rows[0]));
    } catch (err) {
      console.error(`[${table}] Erro ao buscar:`, err.message);
      res.status(500).json({ error: 'Erro ao buscar registro' });
    }
  });

  // Criar
  router.post('/', async (req, res) => {
    try {
      const data = prepareData(req.body);
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const columns = fields.map(col).join(', ');

      const result = await query(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      res.status(201).json(parseRow(result.rows[0]));
    } catch (err) {
      console.error(`[${table}] Erro ao criar:`, err.message);
      res.status(500).json({ error: 'Erro ao criar registro' });
    }
  });

  // Atualizar
  router.patch('/:id', async (req, res) => {
    try {
      const data = prepareData(req.body);
      delete data.id;
      const fields = Object.keys(data);
      if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

      const sets = fields.map((f, i) => `${col(f)} = $${i + 1}`).join(', ');
      const values = Object.values(data);

      const result = await query(
        `UPDATE ${table} SET ${sets} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, req.params.id],
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Registro não encontrado' });
      res.json(parseRow(result.rows[0]));
    } catch (err) {
      console.error(`[${table}] Erro ao atualizar:`, err.message);
      res.status(500).json({ error: 'Erro ao atualizar registro' });
    }
  });

  // Deletar
  router.delete('/:id', async (req, res) => {
    try {
      const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Registro não encontrado' });
      res.json({ success: true });
    } catch (err) {
      console.error(`[${table}] Erro ao deletar:`, err.message);
      res.status(500).json({ error: 'Erro ao deletar registro' });
    }
  });

  /** Converte campos JSONB de volta para objetos e id para string */
  function parseRow(row) {
    if (!row) return row;
    const parsed = { ...row };
    for (const f of jsonbFields) {
      if (typeof parsed[f] === 'string') {
        try { parsed[f] = JSON.parse(parsed[f]); } catch { /* mantém string */ }
      }
    }
    parsed.id = String(parsed.id);
    return parsed;
  }

  /** Prepara dados para insert/update (JSONB → string) */
  function prepareData(body) {
    const data = { ...body };
    for (const f of jsonbFields) {
      if (data[f] !== undefined && typeof data[f] !== 'string') {
        data[f] = JSON.stringify(data[f]);
      }
    }
    delete data.id;
    return data;
  }

  return router;
}

module.exports = createCrudRouter;
