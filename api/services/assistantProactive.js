/**
 * Motor de Proatividade Interna (CQ-07).
 * Gera sugestões baseadas em dados operacionais (faturas vencidas, tickets
 * abertos, tarefas pendentes, obrigações vencendo), com deduplicação,
 * controle de orçamento e kill switch.
 *
 * Gate: evento duplicado não repete; orçamento bloqueia; kill switch mantém portal.
 */
const { query } = require('../db');

// ===== Tipos de sugestão =====

const SUGGESTION_TYPES = {
  overdue_invoices: {
    type: 'overdue_invoices',
    title: (count) => `${count} fatura${count > 1 ? 's' : ''} vencida${count > 1 ? 's' : ''}`,
    body: 'Existem faturas com vencimento ultrapassado. Considere enviar cobrança ou renegociar.',
    action_url: '/financeiro',
    action_label: 'Ver faturas',
  },
  open_tickets: {
    type: 'open_tickets',
    title: (count) => `${count} ticket${count > 1 ? 's' : ''} aberto${count > 1 ? 's' : ''}`,
    body: 'Tickets de suporte aguardando resposta. Priorize os mais antigos.',
    action_url: '/suporte',
    action_label: 'Ver tickets',
  },
  pending_tasks: {
    type: 'pending_tasks',
    title: (count) => `${count} tarefa${count > 1 ? 's' : ''} pendente${count > 1 ? 's' : ''}`,
    body: 'Tarefas criadas mas não iniciadas. Revise e priorize as mais urgentes.',
    action_url: '/tarefas',
    action_label: 'Ver tarefas',
  },
  due_obligations: {
    type: 'due_obligations',
    title: (count) => `${count} obrigação${count > 1 ? 'ões' : ''} vencendo`,
    body: 'Obrigações com vencimento nos próximos 7 dias. Prepare as entregas com antecedência.',
    action_url: '/contabilidade',
    action_label: 'Ver obrigações',
  },
};

// ===== Kill switch =====

async function isProactiveEnabled() {
  const result = await query(
    `SELECT assistant_proactive_enabled FROM settings WHERE id = 1`,
  );
  return result.rows.length > 0 ? result.rows[0].assistant_proactive_enabled : true;
}

async function getDailyTokenLimit() {
  const result = await query(
    `SELECT assistant_budget_daily_tokens FROM settings WHERE id = 1`,
  );
  return result.rows.length > 0 ? result.rows[0].assistant_budget_daily_tokens : 10000;
}

// ===== Orçamento =====

async function getBudgetStatus(userId, tenantId) {
  const limit = await getDailyTokenLimit();
  const result = await query(
    `SELECT tokens_used, requests_count, cost_cents
     FROM assistant_budget
     WHERE user_id = $1 AND tenant_id = $2 AND period_date = CURRENT_DATE`,
    [userId, tenantId],
  );
  const used = result.rows.length > 0 ? result.rows[0].tokens_used : 0;
  return {
    daily_limit: limit,
    tokens_used: used,
    tokens_remaining: Math.max(0, limit - used),
    requests_today: result.rows.length > 0 ? result.rows[0].requests_count : 0,
    budget_exceeded: used >= limit,
  };
}

async function recordUsage(userId, tenantId, tokens, costCents = 0) {
  await query(
    `INSERT INTO assistant_budget (tenant_id, user_id, period_date, tokens_used, requests_count, cost_cents)
     VALUES ($1, $2, CURRENT_DATE, $3, 1, $4)
     ON CONFLICT (tenant_id, user_id, period_date)
     DO UPDATE SET
       tokens_used = assistant_budget.tokens_used + $3,
       requests_count = assistant_budget.requests_count + 1,
       cost_cents = assistant_budget.cost_cents + $4,
       updated_at = now()`,
    [tenantId, userId, tokens, costCents],
  );
}

// ===== Geradores de sugestões =====

async function checkOverdueInvoices(tenantIds) {
  const result = await query(
    `SELECT count(*) AS total
     FROM invoices
     WHERE tenant_id = ANY($1::int[])
       AND status = 'overdue'`,
    [tenantIds],
  );
  return Number(result.rows[0].total);
}

async function checkOpenTickets(tenantIds) {
  const result = await query(
    `SELECT count(*) AS total
     FROM tickets
     WHERE tenant_id = ANY($1::int[])
       AND status = 'open'`,
    [tenantIds],
  );
  return Number(result.rows[0].total);
}

async function checkPendingTasks(tenantIds) {
  const result = await query(
    `SELECT count(*) AS total
     FROM tasks
     WHERE tenant_id = ANY($1::int[])
       AND status = 'todo'`,
    [tenantIds],
  );
  return Number(result.rows[0].total);
}

async function checkDueObligations(tenantIds) {
  const result = await query(
    `SELECT count(*) AS total
     FROM obligations
     WHERE tenant_id = ANY($1::int[])
       AND status != 'done'
       AND due_date IS NOT NULL
       AND due_date <= now() + interval '7 days'`,
    [tenantIds],
  );
  return Number(result.rows[0].total);
}

// ===== Deduplicação =====

const DISMISS_COOLDOWN_HOURS = 24;

async function findExistingPending(userId, tenantId, dedupKey) {
  const result = await query(
    `SELECT id, status, entity_count, created_at, dismissed_at
     FROM assistant_suggestions
     WHERE user_id = $1 AND tenant_id = $2 AND dedup_key = $3
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, tenantId, dedupKey],
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function isRecentlyDismissed(existing) {
  if (!existing || !existing.dismissed_at) return false;
  const dismissed = new Date(existing.dismissed_at);
  const hoursAgo = (Date.now() - dismissed.getTime()) / (1000 * 60 * 60);
  return hoursAgo < DISMISS_COOLDOWN_HOURS;
}

// ===== Geração de sugestões =====

async function generateSuggestions(userContext) {
  const { userId, tenantId, tenantIds, role } = userContext;

  // Kill switch — se desativado, não gera nada
  const enabled = await isProactiveEnabled();
  if (!enabled) return [];

  // Orçamento — se excedido, não gera sugestões
  const budget = await getBudgetStatus(userId, tenantId);
  if (budget.budget_exceeded) return [];

  // Clients não recebem sugestões operacionais
  if (role === 'client') return [];

  const ids = tenantIds || [tenantId];
  const suggestions = [];

  // Verifica cada tipo
  const checks = [
    { type: 'overdue_invoices', count: await checkOverdueInvoices(ids) },
    { type: 'open_tickets', count: await checkOpenTickets(ids) },
    { type: 'pending_tasks', count: await checkPendingTasks(ids) },
    { type: 'due_obligations', count: await checkDueObligations(ids) },
  ];

  for (const check of checks) {
    if (check.count === 0) continue;

    const def = SUGGESTION_TYPES[check.type];
    const dedupKey = check.type; // uma sugestão por tipo

    // Deduplicação: se já existe pendente, atualiza a contagem
    const existing = await findExistingPending(userId, tenantId, dedupKey);

    if (existing && existing.status === 'pending') {
      // Atualiza contagem se mudou
      if (existing.entity_count !== check.count) {
        await query(
          `UPDATE assistant_suggestions
           SET title = $3, entity_count = $4, updated_at = now()
           WHERE id = $1 AND user_id = $2`,
          [existing.id, userId, def.title(check.count), check.count],
        );
      }
      suggestions.push({ id: String(existing.id), ...def, title: def.title(check.count), entity_count: check.count });
      continue;
    }

    // Se foi dispensado recentemente, não recria
    if (existing && isRecentlyDismissed(existing)) continue;

    // Cria nova sugestão
    const result = await query(
      `INSERT INTO assistant_suggestions (tenant_id, user_id, type, dedup_key, title, body, action_url, action_label, entity_count, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now() + interval '24 hours')
       RETURNING id`,
      [tenantId, userId, check.type, dedupKey, def.title(check.count), def.body, def.action_url, def.action_label, check.count],
    );
    suggestions.push({
      id: String(result.rows[0].id),
      type: check.type,
      title: def.title(check.count),
      body: def.body,
      action_url: def.action_url,
      action_label: def.action_label,
      entity_count: check.count,
    });
  }

  return suggestions;
}

// ===== Listagem de sugestões pendentes =====

async function listPendingSuggestions(userId, tenantId) {
  const enabled = await isProactiveEnabled();
  if (!enabled) return [];

  const result = await query(
    `SELECT id, type, title, body, action_url, action_label, entity_count, created_at
     FROM assistant_suggestions
     WHERE user_id = $1 AND tenant_id = $2 AND status = 'pending'
       AND (expires_at IS NULL OR expires_at > now())
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId, tenantId],
  );
  return result.rows.map((r) => ({ ...r, id: String(r.id) }));
}

// ===== Ações do usuário =====

async function dismissSuggestion(userId, tenantId, suggestionId) {
  const result = await query(
    `UPDATE assistant_suggestions
     SET status = 'dismissed', dismissed_at = now()
     WHERE id = $1 AND user_id = $2 AND tenant_id = $3 AND status = 'pending'
     RETURNING id`,
    [suggestionId, userId, tenantId],
  );
  return result.rows.length > 0;
}

async function actOnSuggestion(userId, tenantId, suggestionId) {
  const result = await query(
    `UPDATE assistant_suggestions
     SET status = 'acted', acted_at = now()
     WHERE id = $1 AND user_id = $2 AND tenant_id = $3 AND status = 'pending'
     RETURNING id, action_url`,
    [suggestionId, userId, tenantId],
  );
  if (result.rows.length === 0) return null;
  return { action_url: result.rows[0].action_url };
}

module.exports = {
  generateSuggestions,
  listPendingSuggestions,
  dismissSuggestion,
  actOnSuggestion,
  isProactiveEnabled,
  getBudgetStatus,
  recordUsage,
  getDailyTokenLimit,
};
