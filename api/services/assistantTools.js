/**
 * Registro de Ferramentas do Assistente (CQ-05).
 * Define tools operacionais com ACL por role, parâmetros validados,
 * e flag de aprovação para ações de escrita.
 *
 * Gate: três casos de valor; tool negada por ACL; custo estimado.
 */
const { query } = require('../db');

// ===== Definições de tools =====

const TOOL_DEFINITIONS = [
  {
    name: 'search_clients',
    description: 'Buscar clientes por nome, email ou documento. Retorna lista resumida.',
    category: 'consulta',
    requiresApproval: false,
    allowedRoles: ['superadmin', 'admin', 'accountant', 'viewer', 'client'],
    params: {
      q: { type: 'string', required: true, description: 'Termo de busca (nome, email ou documento)' },
      limit: { type: 'number', required: false, default: 10, max: 50 },
    },
  },
  {
    name: 'search_invoices',
    description: 'Buscar faturas por status ou cliente. Retorna lista com valores e status.',
    category: 'consulta',
    requiresApproval: false,
    allowedRoles: ['superadmin', 'admin', 'accountant', 'viewer'],
    params: {
      status: { type: 'string', required: false, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] },
      limit: { type: 'number', required: false, default: 10, max: 50 },
    },
  },
  {
    name: 'get_dashboard_summary',
    description: 'Resumo operacional: totais de clientes, faturas, tickets e receita do período.',
    category: 'consulta',
    requiresApproval: false,
    allowedRoles: ['superadmin', 'admin', 'accountant', 'viewer'],
    params: {},
  },
  {
    name: 'create_task',
    description: 'Criar uma tarefa vinculada à conversa atual. Requer aprovação do usuário.',
    category: 'escrita',
    requiresApproval: true,
    allowedRoles: ['superadmin', 'admin', 'accountant'],
    params: {
      title: { type: 'string', required: true, description: 'Título da tarefa' },
      description: { type: 'string', required: false },
      priority: { type: 'string', required: false, enum: ['low', 'medium', 'high'], default: 'medium' },
      due_date: { type: 'string', required: false, description: 'Prazo (YYYY-MM-DD)' },
    },
  },
  {
    name: 'navigate',
    description: 'Sugerir navegação para uma página do sistema. Retorna a URL.',
    category: 'navegacao',
    requiresApproval: false,
    allowedRoles: ['superadmin', 'admin', 'accountant', 'viewer', 'client'],
    params: {
      module: { type: 'string', required: true, enum: ['dashboard', 'inbox', 'crm', 'financeiro', 'contabilidade', 'suporte', 'marketing', 'conhecimento', 'tarefas', 'admin'] },
    },
  },
];

// ===== Custo estimado por tool (em tokens LLM aproximados) =====
const TOOL_COSTS = {
  search_clients: { tokens: 200, description: 'Busca de clientes' },
  search_invoices: { tokens: 250, description: 'Busca de faturas' },
  get_dashboard_summary: { tokens: 150, description: 'Resumo do dashboard' },
  create_task: { tokens: 100, description: 'Criação de tarefa' },
  navigate: { tokens: 50, description: 'Sugestão de navegação' },
};

// ===== Validadores =====

function validateParams(toolName, params) {
  const def = TOOL_DEFINITIONS.find((t) => t.name === toolName);
  if (!def) return { valid: false, error: `Tool desconhecida: ${toolName}` };

  const errors = [];
  const validated = {};

  for (const [key, spec] of Object.entries(def.params)) {
    const val = params?.[key];

    if (spec.required && (val === undefined || val === null || val === '')) {
      errors.push(`${key} é obrigatório`);
      continue;
    }

    if (val === undefined || val === null) {
      validated[key] = spec.default;
      continue;
    }

    if (spec.type === 'number' && isNaN(Number(val))) {
      errors.push(`${key} deve ser um número`);
      continue;
    }

    if (spec.enum && !spec.enum.includes(String(val))) {
      errors.push(`${key} deve ser um de: ${spec.enum.join(', ')}`);
      continue;
    }

    if (spec.max && Number(val) > spec.max) {
      validated[key] = spec.max;
      continue;
    }

    validated[key] = spec.type === 'number' ? Number(val) : String(val);
  }

  if (errors.length > 0) return { valid: false, error: errors.join('; ') };
  return { valid: true, params: validated, definition: def };
}

function checkACL(toolName, userRole) {
  const def = TOOL_DEFINITIONS.find((t) => t.name === toolName);
  if (!def) return { allowed: false, reason: 'Tool inexistente' };
  if (!def.allowedRoles.includes(userRole)) {
    return { allowed: false, reason: `Role '${userRole}' não tem permissão para '${toolName}'` };
  }
  return { allowed: true, definition: def };
}

// ===== Executores =====

async function executeSearchClients(params, userContext) {
  const { q, limit } = params;
  const tenantFilter = userContext.role === 'superadmin'
    ? ''
    : 'AND tenant_id = ANY($2::int[])';

  const args = userContext.role === 'superadmin'
    ? [`%${q}%`, limit]
    : [`%${q}%`, userContext.tenantIds, limit];

  const result = await query(
    `SELECT id, name, email, document, phone, status
     FROM clients
     WHERE (name ILIKE $1 OR email ILIKE $1 OR document ILIKE $1)
     ${tenantFilter}
     ORDER BY name ASC
     LIMIT $${userContext.role === 'superadmin' ? '2' : '3'}`,
    args,
  );

  return {
    count: result.rows.length,
    clients: result.rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      email: r.email,
      document: r.document,
      phone: r.phone,
      status: r.status,
    })),
  };
}

async function executeSearchInvoices(params, userContext) {
  const { status, limit } = params;
  const conditions = [];
  const args = [];
  let idx = 1;

  if (userContext.role !== 'superadmin') {
    conditions.push(`tenant_id = ANY($${idx++}::int[])`);
    args.push(userContext.tenantIds);
  }
  if (status) {
    conditions.push(`status = $${idx++}`);
    args.push(status);
  }

  args.push(limit);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT id, number, client_name, issue_date, due_date, discount, status, items
     FROM invoices
     ${whereClause}
     ORDER BY issue_date DESC NULLS LAST
     LIMIT $${idx}`,
    args,
  );

  // Calcula total a partir dos items (jsonb array de {quantity, price})
  const invoices = result.rows.map((r) => {
    const items = Array.isArray(r.items) ? r.items : [];
    const subtotal = items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.price || 0), 0);
    const total = subtotal - Number(r.discount || 0);
    return {
      id: String(r.id),
      number: r.number,
      client_name: r.client_name,
      issue_date: r.issue_date,
      due_date: r.due_date,
      total: total.toFixed(2),
      status: r.status,
    };
  });

  const totalValue = invoices.reduce((sum, r) => sum + Number(r.total), 0);

  return {
    count: invoices.length,
    total_value: totalValue.toFixed(2),
    invoices,
  };
}

async function executeGetDashboardSummary(params, userContext) {
  const useTenant = userContext.role !== 'superadmin';
  const tenantWhere = useTenant ? 'WHERE tenant_id = ANY($1::int[])' : '';
  const args = useTenant ? [userContext.tenantIds] : [];

  const clientsResult = await query(
    `SELECT count(*) AS total FROM clients ${tenantWhere}`,
    args,
  );

  const invoicesResult = await query(
    `SELECT count(*) AS total,
            COALESCE(sum((SELECT COALESCE(sum((elem->>'quantity')::numeric * (elem->>'price')::numeric), 0)
                          FROM jsonb_array_elements(items) AS elem) - COALESCE(discount, 0)), 0) AS revenue
     FROM invoices ${tenantWhere} ${useTenant ? 'AND' : 'WHERE'} status = 'paid'`,
    args,
  );

  const ticketsResult = await query(
    `SELECT count(*) AS total, count(*) FILTER (WHERE status = 'open') AS open
     FROM tickets ${tenantWhere}`,
    args,
  );

  return {
    clients: Number(clientsResult.rows[0].total),
    invoices: Number(invoicesResult.rows[0].total),
    revenue: Number(invoicesResult.rows[0].revenue).toFixed(2),
    tickets: Number(ticketsResult.rows[0].total),
    open_tickets: Number(ticketsResult.rows[0].open),
  };
}

async function executeCreateTask(params, userContext) {
  const { title, description, priority, due_date } = params;
  // conversation_id vem do userContext se disponível
  const convId = userContext.conversationId || null;

  const result = await query(
    `INSERT INTO tasks (title, description, status, priority, due_date, tenant_id, conversation_id, created_by, source)
     VALUES ($1, $2, 'todo', $3, $4, $5, $6, $7, 'assistant_tool')
     RETURNING id, title, status, priority, due_date, source`,
    [title, description || null, priority || 'medium', due_date || null,
     userContext.tenantId, convId, userContext.userId],
  );

  return {
    task_id: String(result.rows[0].id),
    title: result.rows[0].title,
    status: result.rows[0].status,
    priority: result.rows[0].priority,
    source: result.rows[0].source,
  };
}

async function executeNavigate(params) {
  const routeMap = {
    dashboard: '/dashboard',
    inbox: '/inbox',
    crm: '/crm',
    financeiro: '/financeiro',
    contabilidade: '/contabilidade',
    suporte: '/suporte',
    marketing: '/marketing',
    conhecimento: '/conhecimento',
    tarefas: '/tarefas',
    admin: '/admin',
  };
  return {
    module: params.module,
    url: routeMap[params.module] || '/dashboard',
  };
}

const EXECUTORS = {
  search_clients: executeSearchClients,
  search_invoices: executeSearchInvoices,
  get_dashboard_summary: executeGetDashboardSummary,
  create_task: executeCreateTask,
  navigate: executeNavigate,
};

// ===== API pública do módulo =====

/** Lista tools disponíveis para o role do usuário */
function listToolsForRole(userRole) {
  return TOOL_DEFINITIONS
    .filter((t) => t.allowedRoles.includes(userRole))
    .map((t) => ({
      name: t.name,
      description: t.description,
      category: t.category,
      requiresApproval: t.requiresApproval,
      params: Object.entries(t.params).map(([k, v]) => ({
        name: k, type: v.type, required: v.required, description: v.description,
        enum: v.enum, default: v.default,
      })),
    }));
}

/** Executa uma tool com validação de ACL e parâmetros */
async function executeTool(toolName, params, userContext) {
  // 1. Verifica ACL
  const acl = checkACL(toolName, userContext.role);
  if (!acl.allowed) {
    return { success: false, denied: true, reason: acl.reason };
  }

  // 2. Valida parâmetros
  const validation = validateParams(toolName, params);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // 3. Executa
  try {
    const executor = EXECUTORS[toolName];
    const result = await executor(validation.params, userContext);
    const cost = TOOL_COSTS[toolName] || { tokens: 100 };

    return {
      success: true,
      tool: toolName,
      result,
      cost_estimate: cost,
    };
  } catch (err) {
    console.error(`[assistantTools] Erro ao executar ${toolName}:`, err.message);
    return { success: false, error: `Erro ao executar tool: ${err.message}` };
  }
}

module.exports = { listToolsForRole, executeTool, checkACL, TOOL_DEFINITIONS };
