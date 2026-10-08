/**
 * Serviço de Orquestração de Tarefas (AC-GLOBAL-04).
 * Valida transições de status, registra log de execução durável e
 * atualiza timestamps de início/conclusão.
 */
const { query } = require('../db');
const { getAccessibleTenantIds } = require('../middleware/auth');

/** Transições válidas de status */
const VALID_TRANSITIONS = {
  todo: ['in_progress', 'done', 'cancelled'],
  in_progress: ['done', 'cancelled', 'todo'],
  done: ['todo'],
  cancelled: ['todo'],
};

const STATUS_LABELS = {
  todo: 'A Fazer',
  in_progress: 'Em Andamento',
  done: 'Concluída',
  cancelled: 'Cancelada',
};

/**
 * Valida se a transição de status é permitida.
 * @returns {boolean}
 */
function isValidTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Registra uma transição no log de execução da tarefa.
 */
async function appendLog(taskId, entry) {
  await query(
    `UPDATE tasks
       SET execution_log = execution_log || $1::jsonb
     WHERE id = $2`,
    [JSON.stringify([entry]), taskId],
  );
}

/**
 * Transiciona o status de uma tarefa com validação e log durável.
 * @param {number} taskId - ID da tarefa
 * @param {string} newStatus - Novo status (todo|in_progress|done|cancelled)
 * @param {object} user - Usuário autenticado (req.user)
 * @param {string} notes - Notas opcionais sobre a transição
 * @returns {Promise<object>} Tarefa atualizada
 */
async function transitionStatus(taskId, newStatus, user, notes = '') {
  // Busca a tarefa verificando isolamento por tenant
  const tenantIds = await getAccessibleTenantIds(user);
  const result = await query(
    `SELECT id, title, status, tenant_id, execution_log, started_at, completed_at
     FROM tasks
     WHERE id = $1 AND (tenant_id = ANY($2::int[]) OR tenant_id IS NULL)`,
    [taskId, tenantIds],
  );

  if (result.rows.length === 0) {
    const err = new Error('Tarefa não encontrada');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const task = result.rows[0];
  const oldStatus = task.status;

  if (oldStatus === newStatus) {
    return { ...task, id: String(task.id) };
  }

  if (!isValidTransition(oldStatus, newStatus)) {
    const err = new Error(`Transição inválida: ${STATUS_LABELS[oldStatus] || oldStatus} → ${STATUS_LABELS[newStatus] || newStatus}`);
    err.code = 'INVALID_TRANSITION';
    throw err;
  }

  // Define timestamps conforme o novo status
  const updates = ['status = $1', 'updated = CURRENT_DATE'];
  const values = [newStatus];
  let idx = 2;

  if (newStatus === 'in_progress') {
    updates.push(`started_at = COALESCE(started_at, now())`);
  }
  if (newStatus === 'done' || newStatus === 'cancelled') {
    updates.push(`completed_at = now()`);
  }
  if (newStatus === 'todo') {
    updates.push(`started_at = NULL`, `completed_at = NULL`);
  }

  updates.push(`execution_log = execution_log || $${idx++}::jsonb`);
  values.push(JSON.stringify([{
    from: oldStatus,
    to: newStatus,
    by: user?.email || user?.name || 'system',
    at: new Date().toISOString(),
    notes: notes || null,
  }]));

  values.push(taskId, tenantIds);

  const updateResult = await query(
    `UPDATE tasks SET ${updates.join(', ')}
     WHERE id = $${idx++} AND (tenant_id = ANY($${idx++}::int[]) OR tenant_id IS NULL)
     RETURNING id, title, description, status, priority, due_date, assigned_to,
               category, source, conversation_id, created_by, execution_log,
               started_at, completed_at, created, updated`,
    values,
  );

  const updated = updateResult.rows[0];
  return { ...updated, id: String(updated.id) };
}

/**
 * Busca o log de execução de uma tarefa.
 */
async function getExecutionLog(taskId, user) {
  const tenantIds = await getAccessibleTenantIds(user);
  const result = await query(
    `SELECT id, title, status, execution_log, started_at, completed_at
     FROM tasks
     WHERE id = $1 AND (tenant_id = ANY($2::int[]) OR tenant_id IS NULL)`,
    [taskId, tenantIds],
  );

  if (result.rows.length === 0) {
    const err = new Error('Tarefa não encontrada');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return result.rows[0];
}

module.exports = {
  transitionStatus,
  getExecutionLog,
  isValidTransition,
  VALID_TRANSITIONS,
  STATUS_LABELS,
};
