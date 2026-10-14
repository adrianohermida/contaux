/**
 * Verificação canônica de acesso a conversa do assistente.
 * Usada por assistantRoutes.js e server.js (endpoint /knowledge-base/ask).
 *
 * C-12/P0: autorização canônica antes de ler histórico, chamar IA ou escrever.
 * Verifica participante (dono/responsável/participante) E tenant acessível.
 * Erros não revelam existência de conversa estrangeira (retorna null → 404).
 */
const { query } = require('../db');
const { getAccessibleTenantIds } = require('../middleware/auth');

/**
 * Verifica se o usuário tem acesso à conversa.
 * @param {number|string} convId - ID da conversa
 * @param {object} user - usuário autenticado (req.user)
 * @returns {Promise<object|null>} - a conversa (com dot_id) se autorizada, null caso contrário
 */
async function checkConversationAccess(convId, user) {
  const tenantIds = await getAccessibleTenantIds(user);
  const result = await query(
    `SELECT id, tenant_id, user_id, assigned_to, status, title, context, origin,
            conversation_kind, handoff_reason, visitor_name, project_id, dot_id, created_at, updated_at
     FROM assistant_conversations
     WHERE id = $1 AND tenant_id = ANY($2::int[])
       AND (user_id = $3 OR assigned_to = $3
        OR EXISTS (SELECT 1 FROM assistant_participants p WHERE p.conversation_id = $1 AND p.user_id = $3))`,
    [convId, tenantIds, user.id],
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

module.exports = { checkConversationAccess };
