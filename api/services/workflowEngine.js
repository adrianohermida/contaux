/**
 * Motor de execução de workflows — avalia condições e executa ações.
 * Suporta gatilhos: event, schedule, manual.
 */
const { query } = require('../db');
const { sendMail } = require('./mailService');
const emailTemplates = require('./emailTemplates');

/**
 * Busca workflows ativos por gatilho e tenant.
 */
async function getActiveWorkflows(trigger, tenantId) {
  const params = [trigger];
  let where = `WHERE active = true AND trigger = $1`;
  if (tenantId) {
    where += ` AND tenant_id = $2`;
    params.push(tenantId);
  }
  const result = await query(`SELECT * FROM workflows ${where} ORDER BY id`, params);
  return result.rows;
}

/**
 * Avalia uma condição simples (formato: "campo=valor" ou "campo!=valor").
 * O contexto é um objeto com os dados do evento.
 */
function evaluateCondition(condition, context) {
  if (!condition || !condition.trim()) return true;

  const cond = condition.trim();

  // Se a condição é o nome do evento no contexto, está satisfeita
  if (context.event && cond === context.event) return true;

  // Se a condição é "event=valor" e o evento no contexto corresponde
  if (cond.includes('=') && !cond.includes('!=')) {
    const [field, value] = cond.split('=').map((s) => s.trim());
    if (field === 'event' && context.event === value) return true;
  }

  const operators = ['!=', '>=', '<=', '=', '>', '<'];
  for (const op of operators) {
    const idx = condition.indexOf(op);
    if (idx > 0) {
      const field = condition.substring(0, idx).trim();
      const expected = condition.substring(idx + op.length).trim();
      const actual = context[field];
      if (actual === undefined || actual === null) return false;
      const actualStr = String(actual);
      switch (op) {
        case '=':  return actualStr === expected || actualStr.includes(expected);
        case '!=': return actualStr !== expected;
        case '>':  return Number(actualStr) > Number(expected);
        case '<':  return Number(actualStr) < Number(expected);
        case '>=': return Number(actualStr) >= Number(expected);
        case '<=': return Number(actualStr) <= Number(expected);
      }
    }
  }
  // Se não tem operador, verifica se o valor existe no contexto
  return context[condition.trim()] !== undefined;
}

/**
 * Avalia todas as condições (AND — todas precisam ser verdadeiras).
 */
function evaluateAllConditions(conditions, context) {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, context));
}

/**
 * Executa uma única ação.
 */
async function executeAction(action, context) {
  // Ação de email: "Enviar email: NomeDoTemplate"
  if (typeof action === 'string' && action.startsWith('Enviar email: ')) {
    const templateName = action.replace('Enviar email: ', '').trim();
    const templates = emailTemplates.listTemplates();
    const tpl = templates.find((t) => t.name === templateName);
    if (!tpl) {
      return { action, status: 'skipped', reason: `Template "${templateName}" não encontrado` };
    }

    const to = context.email || context.to;
    if (!to) {
      return { action, status: 'skipped', reason: 'Destinatário (email) não fornecido no contexto' };
    }

    try {
      const rendered = await emailTemplates.render(tpl.key, context);
      await sendMail({
        to,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });
      return { action, status: 'sent', to, template: templateName };
    } catch (err) {
      return { action, status: 'error', error: err.message };
    }
  }

  // Ação livre: apenas registra
  return { action, status: 'logged' };
}

/**
 * Executa um workflow específico (por ID) — usado para gatilho manual.
 */
async function executeWorkflowById(workflowId, context = {}) {
  const result = await query('SELECT * FROM workflows WHERE id = $1', [workflowId]);
  if (result.rows.length === 0) {
    return { executed: false, reason: 'Workflow não encontrado' };
  }
  return executeWorkflow(result.rows[0], context);
}

/**
 * Executa um workflow: avalia condições e executa ações.
 */
async function executeWorkflow(workflow, context = {}) {
  const conditionsMet = evaluateAllConditions(workflow.conditions, context);

  if (!conditionsMet) {
    return {
      workflowId: workflow.id,
      name: workflow.name,
      executed: false,
      reason: 'Condições não atendidas',
    };
  }

  const actionResults = [];
  for (const action of (workflow.actions || [])) {
    try {
      const result = await executeAction(action, context);
      actionResults.push(result);
    } catch (err) {
      actionResults.push({ action, status: 'error', error: err.message });
    }
  }

  // Registra execução no log de auditoria
  try {
    await query(
      `INSERT INTO audit_logs (user, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        context.triggered_by || 'system',
        'workflow_executed',
        'workflow',
        workflow.id,
        JSON.stringify({ name: workflow.name, results: actionResults }),
      ]
    );
  } catch {
    // Não bloqueia a execução se o log falhar
  }

  return {
    workflowId: workflow.id,
    name: workflow.name,
    executed: true,
    actions: actionResults,
  };
}

/**
 * Dispara todos os workflows ativos de um determinado evento.
 * @param {string} eventName - Nome do evento (ex: "invoice.created")
 * @param {object} context - Dados do evento (inclui tenant_id, email, etc.)
 */
async function triggerEvent(eventName, context = {}) {
  const workflows = await getActiveWorkflows('event', context.tenant_id);

  // Filtra workflows cujas condições incluem o evento
  const matching = workflows.filter((w) => {
    const conditions = w.conditions || [];
    if (conditions.length === 0) return true; // sem condições = executa em qualquer evento
    return conditions.some((c) => {
      const cond = c.trim();
      if (cond.includes('=')) {
        const [field, value] = cond.split('=').map((s) => s.trim());
        return field === 'event' && value === eventName;
      }
      return cond === eventName;
    });
  });

  const results = [];
  for (const wf of matching) {
    try {
      const result = await executeWorkflow(wf, { ...context, event: eventName });
      results.push(result);
    } catch (err) {
      results.push({
        workflowId: wf.id,
        name: wf.name,
        executed: false,
        error: err.message,
      });
    }
  }

  return { event: eventName, triggered: matching.length, results };
}

module.exports = {
  triggerEvent,
  executeWorkflow,
  executeWorkflowById,
  evaluateCondition,
  evaluateAllConditions,
};
