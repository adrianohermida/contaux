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
  const { requireAuth, getAccessibleTenantIds } = require('../middleware/auth');

  const jsonbFields = new Set(opts.jsonbFields || []);
  const searchFields = opts.searchFields || ['name', 'client_name'];
  // Tabelas que não têm tenant_id (ex: tabelas do sistema)
  const noTenant = opts.noTenant === true;
  // Incluir entradas com tenant_id NULL (globais/compartilhadas) além das do tenant
  const includeNullTenant = opts.includeNullTenant === true;
  // Campos sensíveis a excluir das respostas (ex: password_hash)
  const excludeFields = new Set(opts.excludeFields || []);
  // Roles permitidos (opcional — se não definido, qualquer autenticado)
  const allowedRoles = opts.allowedRoles || null;

  // Todas as rotas CRUD exigem autenticação
  router.use(requireAuth);
  if (allowedRoles) {
    const { requireRole } = require('../middleware/auth');
    router.use(requireRole(...allowedRoles));
  }

  // Palavras reservadas do PostgreSQL que precisam de aspas
  const reserved = new Set(['user', 'from', 'to', 'order', 'group', 'select', 'where', 'limit']);

  /** Coloca aspas duplas no nome da coluna se for palavra reservada */
  function col(name) {
    return reserved.has(name) ? `"${name}"` : name;
  }

  /** Constrói cláusula WHERE de tenant isolation (offset = parâmetros anteriores) */
  async function buildTenantWhere(req, offset = 0) {
    if (noTenant) return { clause: '', params: [] };
    const tenantIds = await getAccessibleTenantIds(req.user);
    const idx = offset + 1;
    if (includeNullTenant) {
      return { clause: `(tenant_id = ANY($${idx}::int[]) OR tenant_id IS NULL)`, params: [tenantIds] };
    }
    return { clause: `tenant_id = ANY($${idx}::int[])`, params: [tenantIds] };
  }

  // Listar (com busca opcional via ?q=)
  router.get('/', async (req, res) => {
    try {
      const { q } = req.query;
      const { clause: tenantClause, params: tenantParams } = await buildTenantWhere(req);
      let sql, params;

      if (q && searchFields.length) {
        const searchConds = searchFields.map((f, i) => `${col(f)} ILIKE $${i + (tenantClause ? 2 : 1)}`).join(' OR ');
        const whereParts = [];
        if (tenantClause) whereParts.push(tenantClause);
        whereParts.push(`(${searchConds})`);
        sql = `SELECT * FROM ${table} WHERE ${whereParts.join(' AND ')} ORDER BY id DESC`;
        params = [...tenantParams, ...searchFields.map(() => `%${q}%`)];
      } else if (tenantClause) {
        sql = `SELECT * FROM ${table} WHERE ${tenantClause} ORDER BY id DESC`;
        params = tenantParams;
      } else {
        sql = `SELECT * FROM ${table} ORDER BY id DESC`;
        params = [];
      }

      const result = await query(sql, params);
      const rows = result.rows.map(parseRow);
      res.json(rows);
    } catch (err) {
      console.error(`[${table}] Erro ao listar:`, err.message);
      res.status(500).json({ error: 'Erro ao buscar registros' });
    }
  });

  // Valida se o parâmetro id é um inteiro válido
  function isValidId(id) {
    return /^\d+$/.test(id);
  }

  // Buscar por ID
  router.get('/:id', async (req, res) => {
    try {
      if (!isValidId(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
      const { clause: tenantClause, params: tenantParams } = await buildTenantWhere(req, 1);
      let sql, params;
      if (tenantClause) {
        sql = `SELECT * FROM ${table} WHERE id = $1 AND ${tenantClause}`;
        params = [req.params.id, ...tenantParams];
      } else {
        sql = `SELECT * FROM ${table} WHERE id = $1`;
        params = [req.params.id];
      }
      const result = await query(sql, params);
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
      // Valida/isola tenant_id — nunca confiar no body sem validação
      if (!noTenant) {
        if (data.tenant_id !== undefined) {
          // Usuário forneceu tenant_id — valida se está na lista de acessíveis
          const tenantIds = await getAccessibleTenantIds(req.user);
          if (!tenantIds.includes(parseInt(data.tenant_id))) {
            return res.status(403).json({ error: 'Tenant não autorizado' });
          }
        } else {
          // Sem tenant_id no body — usa o do usuário
          data.tenant_id = req.user.tenant_id;
        }
      }
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
      if (!isValidId(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
      const data = prepareData(req.body);
      delete data.id;
      // Não permitir alterar tenant_id via CRUD
      delete data.tenant_id;
      const fields = Object.keys(data);
      if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

      const { clause: tenantClause, params: tenantParams } = await buildTenantWhere(req, fields.length + 1);
      const sets = fields.map((f, i) => `${col(f)} = $${i + 1}`).join(', ');
      const values = Object.values(data);

      let sql, params;
      if (tenantClause) {
        sql = `UPDATE ${table} SET ${sets} WHERE id = $${fields.length + 1} AND ${tenantClause} RETURNING *`;
        params = [...values, req.params.id, ...tenantParams];
      } else {
        sql = `UPDATE ${table} SET ${sets} WHERE id = $${fields.length + 1} RETURNING *`;
        params = [...values, req.params.id];
      }
      const result = await query(sql, params);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Registro não encontrado' });
      res.json(parseRow(result.rows[0]));
    } catch (err) {
      console.error(`[${table}] Erro ao atualizar:`, err.message);
      res.status(500).json({ error: 'Erro ao atualizar registro' });
    }
  });

  // Deletar — se pinProtectedDelete, exige X-PIN-Token válido
  const deleteHandler = async (req, res) => {
    try {
      if (!isValidId(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
      const { clause: tenantClause, params: tenantParams } = await buildTenantWhere(req, 1);
      let sql, params;
      if (tenantClause) {
        sql = `DELETE FROM ${table} WHERE id = $1 AND ${tenantClause} RETURNING id`;
        params = [req.params.id, ...tenantParams];
      } else {
        sql = `DELETE FROM ${table} WHERE id = $1 RETURNING id`;
        params = [req.params.id];
      }
      const result = await query(sql, params);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Registro não encontrado' });
      res.json({ success: true });
    } catch (err) {
      console.error(`[${table}] Erro ao deletar:`, err.message);
      res.status(500).json({ error: 'Erro ao deletar registro' });
    }
  };

  if (opts.pinProtectedDelete) {
    const { requirePin } = require('../middleware/pin');
    router.delete('/:id', requirePin, deleteHandler);
  } else {
    router.delete('/:id', deleteHandler);
  }

  /** Converte campos JSONB de volta para objetos, exclui campos sensíveis e formata id */
  function parseRow(row) {
    if (!row) return row;
    const parsed = { ...row };
    for (const f of jsonbFields) {
      if (typeof parsed[f] === 'string') {
        try { parsed[f] = JSON.parse(parsed[f]); } catch { /* mantém string */ }
      }
    }
    for (const f of excludeFields) {
      delete parsed[f];
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
