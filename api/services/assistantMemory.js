/**
 * Serviço de Memória do Assistente (CQ-06).
 * Memória auditável por escopo: user, tenant, conversation.
 * Isolamento por tenant_id — memória cruzada entre tenants é impossível.
 *
 * Gate: memória cruzada inexistente.
 */
const { query } = require('../db');

/**
 * Lista memórias do escopo solicitado, sempre filtrado por tenant.
 * @param {object} userContext — { userId, tenantId, role, tenantIds }
 * @param {string} scope — 'user' | 'tenant' | 'conversation'
 * @param {object} opts — { conversationId }
 */
async function listMemories(userContext, scope, opts = {}) {
  const conditions = ['tenant_id = $1'];
  const args = [userContext.tenantId];
  let idx = 2;

  if (scope === 'user') {
    conditions.push(`scope = 'user'`);
    conditions.push(`user_id = $${idx++}`);
    args.push(userContext.userId);
  } else if (scope === 'tenant') {
    conditions.push(`scope = 'tenant'`);
    conditions.push(`user_id IS NULL`);
  } else if (scope === 'conversation') {
    if (!opts.conversationId) return [];
    conditions.push(`scope = 'conversation'`);
    conditions.push(`conversation_id = $${idx++}`);
    args.push(opts.conversationId);
  } else {
    // Sem escopo definido: retorna user + tenant do usuário
    conditions.push(`((scope = 'user' AND user_id = $${idx++}) OR (scope = 'tenant' AND user_id IS NULL))`);
    args.push(userContext.userId);
  }

  const result = await query(
    `SELECT id, scope, key, value, created_at, updated_at
     FROM assistant_memory
     WHERE ${conditions.join(' AND ')}
     ORDER BY updated_at DESC
     LIMIT 100`,
    args,
  );

  return result.rows.map((r) => ({ ...r, id: String(r.id) }));
}

/**
 * Cria ou atualiza uma memória (upsert por escopo + key).
 * Sempre grava com o tenant_id do usuário autenticado.
 */
async function saveMemory(userContext, scope, key, value, opts = {}) {
  if (!key || !key.trim()) throw new Error('key é obrigatório');
  if (!value) throw new Error('value é obrigatório');

  let userId = null;
  let conversationId = null;

  if (scope === 'user') {
    userId = userContext.userId;
  } else if (scope === 'conversation') {
    if (!opts.conversationId) throw new Error('conversationId é obrigatório para escopo conversation');
    conversationId = opts.conversationId;
    userId = userContext.userId;
  }

  const result = await query(
    `INSERT INTO assistant_memory (tenant_id, user_id, conversation_id, scope, key, value, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (tenant_id, user_id, conversation_id, scope, key)
     DO UPDATE SET value = EXCLUDED.value, updated_at = now()
     RETURNING id, scope, key, value, created_at, updated_at`,
    [userContext.tenantId, userId, conversationId, scope, key.trim(), value, userContext.userId],
  );

  return { ...result.rows[0], id: String(result.rows[0].id) };
}

/**
 * Remove uma memória. Valida tenant_id para impedir exclusão cruzada.
 */
async function deleteMemory(userContext, memoryId) {
  const result = await query(
    `DELETE FROM assistant_memory WHERE id = $1 AND tenant_id = $2 RETURNING id`,
    [memoryId, userContext.tenantId],
  );
  return result.rows.length > 0;
}

/**
 * Busca memórias relevantes para enriquecer o contexto da IA.
 * Retorna user + tenant memories (não conversation — essas são muitas).
 */
async function getContextMemories(userContext, conversationId) {
  const conditions = [
    `tenant_id = $1`,
    `(scope = 'tenant' AND user_id IS NULL) OR (scope = 'user' AND user_id = $2)`,
  ];
  const args = [userContext.tenantId, userContext.userId];
  let idx = 3;

  if (conversationId) {
    conditions.push(`OR (scope = 'conversation' AND conversation_id = $${idx++})`);
    args.push(conversationId);
  }

  const result = await query(
    `SELECT scope, key, value FROM assistant_memory
     WHERE ${conditions.join(' ')}
     ORDER BY updated_at DESC
     LIMIT 50`,
    args,
  );

  return result.rows;
}

module.exports = { listMemories, saveMemory, deleteMemory, getContextMemories };
