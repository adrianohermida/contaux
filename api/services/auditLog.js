/**
 * Serviço de log de auditoria para operações de escrita (POST/PATCH/DELETE).
 * Registra automaticamente quem, o quê, quando e de onde.
 * Não bloqueia a resposta — o log é fire-and-forget (async, sem await).
 */
const { query } = require('../db');

/**
 * Registra uma ação de auditoria.
 * @param {object} params - { user, action, entityType, entityId, details, ip }
 */
async function logAudit({ user, action, entityType, entityId, details, ip }) {
  try {
    await query(
      `INSERT INTO audit_logs ("user", action, entity_type, entity_id, details, ip)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user || null,
        action,
        entityType || null,
        entityId ? String(entityId) : null,
        details || null,
        ip || null,
      ],
    );
  } catch (err) {
    // Log de auditoria não deve quebrar a operação principal
    console.error('[auditLog] Erro ao registrar auditoria:', err.message);
  }
}

/**
 * Middleware Express que registra operações de escrita após sucesso.
 * Deve ser colocado APÓS o handler da rota (não é middleware pré-handler).
 * Em vez disso, use a função logAudit diretamente nos handlers.
 */

/**
 * Helper para extrair IP do request (considera proxy).
 */
function getRequestIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || null;
}

module.exports = { logAudit, getRequestIp };
