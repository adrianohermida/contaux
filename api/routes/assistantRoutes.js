/**
 * Rotas do Assistente — conversas persistentes (AC-GLOBAL-02 + CQ-04).
 * CRUD de conversas e mensagens com isolamento por tenant e usuário.
 * CQ-04: participantes múltiplos, handoff IA→humano, fila de atendimento.
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { query, pool } = require('../db');
const { requireAuth, requireRole, getAccessibleTenantIds } = require('../middleware/auth');
const { listToolsForRole, executeTool } = require('../services/assistantTools');
const { listMemories, saveMemory, deleteMemory } = require('../services/assistantMemory');
const { validateFile } = require('../services/mimeValidator');
const {
  generateSuggestions, listPendingSuggestions, dismissSuggestion, actOnSuggestion,
  isProactiveEnabled, getBudgetStatus,
} = require('../services/assistantProactive');

// ===== Diretório de uploads do assistente =====
const attDir = path.join(__dirname, '..', 'uploads', 'assistant');
if (!fs.existsSync(attDir)) fs.mkdirSync(attDir, { recursive: true });

const attStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, attDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const attUpload = multer({
  storage: attStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.use(requireAuth);

// ===== Helper: verifica acesso à conversa (participante + tenant) =====
// Retorna a conversa se o usuário tem acesso, null caso contrário.
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

// ===== Ferramentas operacionais (CQ-05) =====

// Listar tools disponíveis para o role do usuário
router.get('/tools', (req, res) => {
  res.json(listToolsForRole(req.user.role));
});

// Executar uma tool (com ACL e validação)
router.post('/tools/execute', async (req, res) => {
  try {
    const { tool, params, conversation_id } = req.body;
    if (!tool) return res.status(400).json({ error: 'tool é obrigatório' });

    // Monta contexto do usuário para a tool
    const tenantIds = await getAccessibleTenantIds(req.user);
    const userContext = {
      userId: req.user.id,
      tenantId: req.user.tenant_id,
      tenantIds,
      role: req.user.role,
      conversationId: conversation_id || null,
    };

    const result = await executeTool(tool, params || {}, userContext);
    if (result.denied) return res.status(403).json(result);
    if (!result.success) return res.status(400).json(result);

    // Salva resultado da tool como mensagem de sistema (autoria do servidor)
    if (conversation_id) {
      try {
        const summary = JSON.stringify(result.result, null, 2).substring(0, 500);
        await query(
          `INSERT INTO assistant_messages (conversation_id, role, text, event_type)
           VALUES ($1, 'system', $2, 'tool_result')`,
          [conversation_id, `🔧 ${tool}: ${summary}`],
        );
        await query(`UPDATE assistant_conversations SET updated_at = now() WHERE id = $1`, [conversation_id]);
      } catch (e) {
        // Não bloqueia a resposta se falhar ao salvar
      }
    }

    res.json(result);
  } catch (err) {
    console.error('[assistant] Erro ao executar tool:', err.message);
    res.status(500).json({ error: 'Erro ao executar tool' });
  }
});

// ===== Proatividade interna (CQ-07) =====

// Listar sugestões proativas pendentes
router.get('/suggestions', async (req, res) => {
  try {
    const suggestions = await listPendingSuggestions(req.user.id, req.user.tenant_id);
    res.json(suggestions);
  } catch (err) {
    console.error('[assistant] Erro ao listar sugestões:', err.message);
    res.status(500).json({ error: 'Erro ao buscar sugestões' });
  }
});

// Gerar novas sugestões (chamado periodicamente pelo frontend)
router.post('/suggestions/generate', async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const suggestions = await generateSuggestions({
      userId: req.user.id,
      tenantId: req.user.tenant_id,
      tenantIds,
      role: req.user.role,
    });
    res.json(suggestions);
  } catch (err) {
    console.error('[assistant] Erro ao gerar sugestões:', err.message);
    res.status(500).json({ error: 'Erro ao gerar sugestões' });
  }
});

// Dispensar sugestão
router.post('/suggestions/:id/dismiss', async (req, res) => {
  try {
    const ok = await dismissSuggestion(req.user.id, req.user.tenant_id, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Sugestão não encontrada' });
    res.json({ success: true });
  } catch (err) {
    console.error('[assistant] Erro ao dispensar sugestão:', err.message);
    res.status(500).json({ error: 'Erro ao dispensar sugestão' });
  }
});

// Agir sobre sugestão (marca como agida e retorna URL de navegação)
router.post('/suggestions/:id/act', async (req, res) => {
  try {
    const result = await actOnSuggestion(req.user.id, req.user.tenant_id, req.params.id);
    if (!result) return res.status(404).json({ error: 'Sugestão não encontrada' });
    res.json({ success: true, action_url: result.action_url });
  } catch (err) {
    console.error('[assistant] Erro ao agir sobre sugestão:', err.message);
    res.status(500).json({ error: 'Erro ao agir sobre sugestão' });
  }
});

// Status da proatividade (kill switch + orçamento)
router.get('/proactive/status', async (req, res) => {
  try {
    const enabled = await isProactiveEnabled();
    const budget = await getBudgetStatus(req.user.id, req.user.tenant_id);
    res.json({ enabled, budget });
  } catch (err) {
    console.error('[assistant] Erro ao buscar status proativo:', err.message);
    res.status(500).json({ error: 'Erro ao buscar status' });
  }
});

// ===== Fila de atendimento (staff) — deve vir antes de /:id =====

// Listar conversas aguardando atendimento humano (staff only)
// SEGURANÇA: filtra por tenants acessíveis ao usuário — sem acesso cruzado entre empresas
router.get('/conversations/queue', requireRole('admin', 'superadmin', 'accountant'), async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query(
      `SELECT c.id, c.title, c.status, c.origin, c.conversation_kind, c.visitor_name,
              c.handoff_reason, c.tenant_id, c.created_at, c.updated_at,
              (SELECT count(*) FROM assistant_messages WHERE conversation_id = c.id AND role = 'user') AS msg_count,
              (SELECT max(created_at) FROM assistant_messages WHERE conversation_id = c.id) AS last_msg_at
       FROM assistant_conversations c
       WHERE c.status = 'waiting_human' AND c.tenant_id = ANY($1::int[])
       ORDER BY c.updated_at ASC
       LIMIT 50`,
      [tenantIds],
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id) })));
  } catch (err) {
    console.error('[assistant] Erro ao buscar fila:', err.message);
    res.status(500).json({ error: 'Erro ao buscar fila de atendimento' });
  }
});

// ===== Dots (assistentes configuráveis) =====

// Listar dots do tenant
router.get('/dots', async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query(
      `SELECT id, name, description, system_prompt, color, icon, is_active, created_at, updated_at
       FROM assistant_dots
       WHERE tenant_id = ANY($1::int[])
       ORDER BY updated_at DESC`,
      [tenantIds],
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id) })));
  } catch (err) {
    console.error('[assistant] Erro ao listar dots:', err.message);
    res.status(500).json({ error: 'Erro ao buscar assistentes' });
  }
});

// Criar dot
router.post('/dots', async (req, res) => {
  try {
    const { name, description, system_prompt, color, icon } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Nome é obrigatório' });

    const result = await query(
      `INSERT INTO assistant_dots (tenant_id, created_by, name, description, system_prompt, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, system_prompt, color, icon, is_active, created_at, updated_at`,
      [req.user.tenant_id, req.user.id, name.trim(), description || null,
       system_prompt || '', color || '#3763EB', icon || 'Bot'],
    );
    const row = result.rows[0];
    res.status(201).json({ ...row, id: String(row.id) });
  } catch (err) {
    console.error('[assistant] Erro ao criar dot:', err.message);
    res.status(500).json({ error: 'Erro ao criar assistente' });
  }
});

// Atualizar dot
router.patch('/dots/:id', async (req, res) => {
  try {
    const { name, description, system_prompt, color, icon, is_active } = req.body;
    const tenantIds = await getAccessibleTenantIds(req.user);
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (system_prompt !== undefined) { fields.push(`system_prompt = $${idx++}`); values.push(system_prompt); }
    if (color !== undefined) { fields.push(`color = $${idx++}`); values.push(color); }
    if (icon !== undefined) { fields.push(`icon = $${idx++}`); values.push(icon); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });

    fields.push(`updated_at = now()`);
    values.push(req.params.id, tenantIds);

    const result = await query(
      `UPDATE assistant_dots SET ${fields.join(', ')}
       WHERE id = $${idx++} AND tenant_id = ANY($${idx++}::int[])
       RETURNING id, name, description, system_prompt, color, icon, is_active, created_at, updated_at`,
      values,
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assistente não encontrado' });
    const row = result.rows[0];
    res.json({ ...row, id: String(row.id) });
  } catch (err) {
    console.error('[assistant] Erro ao atualizar dot:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar assistente' });
  }
});

// Deletar dot
router.delete('/dots/:id', async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query(
      `DELETE FROM assistant_dots WHERE id = $1 AND tenant_id = ANY($2::int[]) RETURNING id`,
      [req.params.id, tenantIds],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assistente não encontrado' });
    res.json({ success: true });
  } catch (err) {
    console.error('[assistant] Erro ao deletar dot:', err.message);
    res.status(500).json({ error: 'Erro ao deletar assistente' });
  }
});

// ===== Conversas =====

// Listar conversas do usuário (mais recentes primeiro) — paginado
// Inclui conversas onde o usuário é dono, responsável ou participante,
// filtradas pelos tenants acessíveis ao usuário.
router.get('/conversations', async (req, res) => {
  try {
    const { kind, q } = req.query;
    const offset = Math.max(0, parseInt(req.query.offset || '0', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const tenantIds = await getAccessibleTenantIds(req.user);

    const conditions = [
      `c.tenant_id = ANY($1::int[])`,
      `(c.user_id = $2 OR c.assigned_to = $2
        OR EXISTS (SELECT 1 FROM assistant_participants p WHERE p.conversation_id = c.id AND p.user_id = $2))`,
    ];
    const args = [tenantIds, req.user.id];
    let idx = 3;

    if (kind) {
      conditions.push(`c.conversation_kind = $${idx++}`);
      args.push(kind);
    }
    if (q) {
      conditions.push(`c.title ILIKE $${idx++}`);
      args.push(`%${q}%`);
    }

    args.push(limit, offset);

    const result = await query(
      `SELECT c.id, c.title, c.context, c.status, c.origin, c.assigned_to,
              c.conversation_kind, c.tenant_id, c.project_id, c.dot_id,
              c.created_at, c.updated_at,
              (SELECT count(*) FROM assistant_messages WHERE conversation_id = c.id) AS message_count,
              p.color AS project_color, p.name AS project_name
       FROM assistant_conversations c
       LEFT JOIN assistant_projects p ON p.id = c.project_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY c.updated_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      args,
    );

    const countResult = await query(
      `SELECT count(*) AS total FROM assistant_conversations c
       WHERE ${conditions.join(' AND ')}`,
      args.slice(0, -2),  // exclude limit/offset
    );
    const total = parseInt(countResult.rows[0].total, 10);

    res.json({
      conversations: result.rows.map((r) => ({
        ...r,
        id: String(r.id),
        project_id: r.project_id ? String(r.project_id) : null,
        dot_id: r.dot_id ? String(r.dot_id) : null,
        context: typeof r.context === 'string' ? JSON.parse(r.context) : r.context,
      })),
      total,
      hasMore: offset + result.rows.length < total,
    });
  } catch (err) {
    console.error('[assistant] Erro ao listar conversas:', err.message);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

// Criar nova conversa
// Aceita conversation_kind (ai/support/internal) — padrão 'ai'
router.post('/conversations', async (req, res) => {
  try {
    const { title, context, conversation_kind, project_id, dot_id } = req.body;
    const kind = ['ai', 'support', 'internal'].includes(conversation_kind) ? conversation_kind : 'ai';
    const participantRole = req.user.role === 'client' ? 'client' : 'staff';
    const origin = req.user.role === 'client' ? 'public' : 'internal';

    // Valida project_id se fornecido
    let validProjectId = null;
    if (project_id) {
      const tenantIds = await getAccessibleTenantIds(req.user);
      const projCheck = await query(
        `SELECT id FROM assistant_projects WHERE id = $1 AND tenant_id = ANY($2::int[])`,
        [project_id, tenantIds],
      );
      if (projCheck.rows.length > 0) validProjectId = projCheck.rows[0].id;
    }

    // Valida dot_id se fornecido
    let validDotId = null;
    if (dot_id) {
      const tenantIds = await getAccessibleTenantIds(req.user);
      const dotCheck = await query(
        `SELECT id FROM assistant_dots WHERE id = $1 AND tenant_id = ANY($2::int[]) AND is_active = true`,
        [dot_id, tenantIds],
      );
      if (dotCheck.rows.length > 0) validDotId = dotCheck.rows[0].id;
    }

    const result = await query(
      `INSERT INTO assistant_conversations (user_id, tenant_id, title, context, origin, conversation_kind, project_id, dot_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, context, status, origin, conversation_kind, project_id, dot_id, created_at, updated_at`,
      [req.user.id, req.user.tenant_id, title || 'Nova conversa', context ? JSON.stringify(context) : null, origin, kind, validProjectId, validDotId],
    );
    const row = result.rows[0];

    // Adiciona o criador como participante
    await query(
      `INSERT INTO assistant_participants (conversation_id, user_id, role, display_name)
       VALUES ($1, $2, $3, $4)`,
      [row.id, req.user.id, participantRole, req.user.name || null],
    );

    res.status(201).json({
      ...row,
      id: String(row.id),
      project_id: row.project_id ? String(row.project_id) : null,
      dot_id: row.dot_id ? String(row.dot_id) : null,
      context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
    });
  } catch (err) {
    console.error('[assistant] Erro ao criar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao criar conversa' });
  }
});

// Buscar conversa com mensagens e participantes
router.get('/conversations/:id', async (req, res) => {
  try {
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    const msgResult = await query(
      `SELECT id, role, text, sources, author_id, author_name, event_type, created_at
       FROM assistant_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conv.id],
    );

    const partResult = await query(
      `SELECT p.user_id, p.role, p.display_name
       FROM assistant_participants p
       WHERE p.conversation_id = $1`,
      [conv.id],
    );

    res.json({
      ...conv,
      id: String(conv.id),
      project_id: conv.project_id ? String(conv.project_id) : null,
      dot_id: conv.dot_id ? String(conv.dot_id) : null,
      context: typeof conv.context === 'string' ? JSON.parse(conv.context) : conv.context,
      messages: msgResult.rows.map((m) => ({
        ...m,
        id: String(m.id),
        sources: typeof m.sources === 'string' ? JSON.parse(m.sources) : m.sources,
      })),
      participants: partResult.rows.map((p) => ({ ...p, user_id: p.user_id ? String(p.user_id) : null })),
    });
  } catch (err) {
    console.error('[assistant] Erro ao buscar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

// Atualizar conversa (título / contexto)
router.patch('/conversations/:id', async (req, res) => {
  try {
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    const { title, context } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (context !== undefined) { fields.push(`context = $${idx++}`); values.push(JSON.stringify(context)); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });

    fields.push(`updated_at = now()`);
    values.push(req.params.id);

    const result = await query(
      `UPDATE assistant_conversations SET ${fields.join(', ')}
       WHERE id = $${idx++}
       RETURNING id, title, context, status, origin, conversation_kind, created_at, updated_at`,
      values,
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });
    const row = result.rows[0];
    res.json({
      ...row,
      id: String(row.id),
      context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
    });
  } catch (err) {
    console.error('[assistant] Erro ao atualizar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar conversa' });
  }
});

// Deletar conversa
router.delete('/conversations/:id', async (req, res) => {
  try {
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    // Apenas o criador ou admin do tenant pode deletar
    if (conv.user_id !== req.user.id && req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas o criador ou administrador pode deletar' });
    }

    await query(`DELETE FROM assistant_conversations WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[assistant] Erro ao deletar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao deletar conversa' });
  }
});

// ===== Handoff IA→Humano (CQ-04) =====

// Solicitar handoff (qualquer participante pode pedir)
router.post('/conversations/:id/handoff', async (req, res) => {
  try {
    const { reason } = req.body;
    const convId = req.params.id;

    const conv = await checkConversationAccess(convId, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });
    if (conv.status !== 'active') {
      return res.status(409).json({ error: 'Conversa não está ativa' });
    }

    await query(
      `UPDATE assistant_conversations SET status = 'waiting_human', handoff_reason = $2, conversation_kind = 'support', updated_at = now()'
       WHERE id = $1`,
      [convId, reason || null],
    );

    await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, event_type, author_name)
       VALUES ($1, 'system', $2, 'handoff_requested', $3)`,
      [convId, reason || 'Atendimento humano solicitado', req.user.name || 'Usuário'],
    );

    res.json({ success: true, status: 'waiting_human' });
  } catch (err) {
    console.error('[assistant] Erro ao solicitar handoff:', err.message);
    res.status(500).json({ error: 'Erro ao solicitar handoff' });
  }
});

// Aceitar handoff (staff only)
// Atribuição concorrente segura: UPDATE atômico com WHERE status = 'waiting_human'
// impede que dois responsáveis ganhem o mesmo atendimento. Transação garante atomicidade.
// Verifica tenant acessível ao usuário antes de atribuir.
router.post('/conversations/:id/accept', requireRole('admin', 'superadmin', 'accountant'), async (req, res) => {
  try {
    const convId = req.params.id;
    const tenantIds = await getAccessibleTenantIds(req.user);

    // C-15: transação atômica — UPDATE + participante + evento no mesmo bloco
    // Garante que o aceite só persiste se TODAS as escritas forem bem-sucedidas
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // UPDATE atômico: só sucesso se status ainda é 'waiting_human' E tenant é acessível
      const result = await client.query(
        `UPDATE assistant_conversations
         SET status = 'with_human', assigned_to = $1, conversation_kind = 'support', updated_at = now()
         WHERE id = $2 AND status = 'waiting_human' AND tenant_id = ANY($3::int[])
         RETURNING id, tenant_id`,
        [req.user.id, convId, tenantIds],
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        // Distingue: não existe, já assumido, ou sem permissão de tenant
        // C-15: filtra por tenant para não vazar existência/estado de conversa estrangeira
        const conv = await query(
          `SELECT id, status FROM assistant_conversations
           WHERE id = $1 AND tenant_id = ANY($2::int[])`,
          [convId, tenantIds],
        );
        if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });
        if (conv.rows[0].status !== 'waiting_human') return res.status(409).json({ error: 'Atendimento já foi assumido' });
        return res.status(403).json({ error: 'Sem permissão para este tenant' });
      }

      // Adiciona staff como participante se ainda não for
      await client.query(
        `INSERT INTO assistant_participants (conversation_id, user_id, role, display_name)
         VALUES ($1, $2, 'staff', $3)
         ON CONFLICT (conversation_id, user_id) DO NOTHING`,
        [convId, req.user.id, req.user.name || null],
      );

      // Registra evento
      await client.query(
        `INSERT INTO assistant_messages (conversation_id, role, text, event_type, author_name)
         VALUES ($1, 'system', $2, 'handoff_accepted', $3)`,
        [convId, `${req.user.name || 'Atendente'} assumiu o atendimento`, req.user.name || 'Atendente'],
      );

      await client.query('COMMIT');
      res.json({ success: true, status: 'with_human', assigned_to: String(req.user.id) });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[assistant] Erro ao aceitar handoff:', err.message);
    res.status(500).json({ error: 'Erro ao aceitar handoff' });
  }
});

// Fechar conversa (staff only)
router.post('/conversations/:id/close', requireRole('admin', 'superadmin', 'accountant'), async (req, res) => {
  try {
    const convId = req.params.id;
    const conv = await checkConversationAccess(convId, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });
    if (conv.assigned_to !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Conversa não está atribuída a você' });
    }

    await query(
      `UPDATE assistant_conversations SET status = 'closed', updated_at = now() WHERE id = $1`,
      [convId],
    );

    await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, event_type, author_name)
       VALUES ($1, 'system', $2, 'conversation_closed', $3)`,
      [convId, 'Atendimento encerrado', req.user.name || 'Atendente'],
    );

    res.json({ success: true, status: 'closed' });
  } catch (err) {
    console.error('[assistant] Erro ao fechar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao fechar conversa' });
  }
});

// ===== Mensagens =====

// Adicionar mensagem a uma conversa
// SEGURANÇA: role é sempre 'user' — o servidor define a autoria, nunca o cliente.
// Mensagens 'assistant' e 'system' só são criadas pelo backend (rotas internas).
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { text, sources } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'text é obrigatório' });

    // Verifica acesso à conversa (participante + tenant)
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    // Role sempre 'user' — o servidor define a autoria, nunca o cliente
    const role = 'user';
    const result = await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, sources, author_id, author_name)
       VALUES ($1, 'user', $2, $3, $4, $5)
       RETURNING id, role, text, sources, author_id, author_name, event_type, created_at`,
      [
        req.params.id,
        text,
        sources ? JSON.stringify(sources) : null,
        req.user.id,
        req.user.name,
      ],
    );
    const row = result.rows[0];

    await query(`UPDATE assistant_conversations SET updated_at = now() WHERE id = $1`, [req.params.id]);

    res.status(201).json({
      ...row,
      id: String(row.id),
      sources: typeof row.sources === 'string' ? JSON.parse(row.sources) : row.sources,
      author_id: row.author_id ? String(row.author_id) : null,
    });
  } catch (err) {
    console.error('[assistant] Erro ao salvar mensagem:', err.message);
    res.status(500).json({ error: 'Erro ao salvar mensagem' });
  }
});

// ===== Tarefas vinculadas à conversa (AC-GLOBAL-04) =====

// Listar tarefas de uma conversa
router.get('/conversations/:id/tasks', async (req, res) => {
  try {
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    const result = await query(
      `SELECT id, title, description, status, priority, due_date, assigned_to, category, source, created, updated
       FROM tasks
       WHERE conversation_id = $1
       ORDER BY created DESC`,
      [req.params.id],
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id) })));
  } catch (err) {
    console.error('[assistant] Erro ao listar tarefas da conversa:', err.message);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

// Criar tarefa vinculada a uma conversa
router.post('/conversations/:id/tasks', async (req, res) => {
  try {
    const { title, description, priority, due_date, assigned_to, category } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'title é obrigatório' });

    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    const tenantId = conv.tenant_id;
    const result = await query(
      `INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, category, tenant_id, conversation_id, created_by, source)
       VALUES ($1, $2, 'todo', $3, $4, $5, $6, $7, $8, $9, 'assistant')
       RETURNING id, title, description, status, priority, due_date, assigned_to, category, source, created, updated`,
      [
        title.trim(),
        description || null,
        priority || 'medium',
        due_date || null,
        assigned_to || null,
        category || null,
        tenantId,
        req.params.id,
        req.user.id,
      ],
    );
    const row = result.rows[0];
    res.status(201).json({ ...row, id: String(row.id) });
  } catch (err) {
    console.error('[assistant] Erro ao criar tarefa:', err.message);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// ===== Memória auditável por escopo (CQ-06) =====

// Listar memórias do usuário/tenant
router.get('/memory', async (req, res) => {
  try {
    const { scope, conversation_id } = req.query;
    const memories = await listMemories(
      { userId: req.user.id, tenantId: req.user.tenant_id, role: req.user.role },
      scope || 'all',
      { conversationId: conversation_id },
    );
    res.json(memories);
  } catch (err) {
    console.error('[assistant] Erro ao listar memória:', err.message);
    res.status(500).json({ error: 'Erro ao buscar memória' });
  }
});

// Criar/atualizar memória
router.post('/memory', async (req, res) => {
  try {
    const { scope, key, value, conversation_id } = req.body;
    if (!scope || !['user', 'tenant', 'conversation'].includes(scope)) {
      return res.status(400).json({ error: 'scope inválido' });
    }
    if (scope === 'tenant' && req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas admin pode criar memória de tenant' });
    }
    const memory = await saveMemory(
      { userId: req.user.id, tenantId: req.user.tenant_id, role: req.user.role },
      scope, key, value, { conversationId: conversation_id },
    );
    res.status(201).json(memory);
  } catch (err) {
    console.error('[assistant] Erro ao salvar memória:', err.message);
    res.status(500).json({ error: err.message || 'Erro ao salvar memória' });
  }
});

// Deletar memória
router.delete('/memory/:id', async (req, res) => {
  try {
    const ok = await deleteMemory(
      { userId: req.user.id, tenantId: req.user.tenant_id, role: req.user.role },
      req.params.id,
    );
    if (!ok) return res.status(404).json({ error: 'Memória não encontrada' });
    res.json({ success: true });
  } catch (err) {
    console.error('[assistant] Erro ao deletar memória:', err.message);
    res.status(500).json({ error: 'Erro ao deletar memória' });
  }
});

// ===== Anexos privados com ACL (CQ-06) =====

// Upload de anexo para uma conversa
router.post('/conversations/:id/attachments', attUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    // Verifica acesso à conversa (participante + tenant)
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    const convTenantId = conv.tenant_id;

    // Valida MIME pelo magic number
    const fileBuffer = fs.readFileSync(req.file.path);
    const validation = validateFile(fileBuffer, req.file.mimetype, req.file.originalname);
    if (!validation.valid) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: validation.error });
    }

    const result = await query(
      `INSERT INTO assistant_attachments (conversation_id, tenant_id, uploaded_by, filename, mime_type, file_size, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, filename, mime_type, file_size, created_at`,
      [req.params.id, convTenantId, req.user.id, req.file.originalname,
       validation.mime, req.file.size, req.file.filename],
    );
    const row = result.rows[0];

    // Salva mensagem de sistema (autoria definida pelo servidor, não pelo cliente)
    await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, event_type, author_name)
       VALUES ($1, 'system', $2, 'attachment', $3)`,
      [req.params.id, `📎 ${req.file.originalname}`, req.user.name || null],
    );
    await query(`UPDATE assistant_conversations SET updated_at = now() WHERE id = $1`, [req.params.id]);

    res.status(201).json({ ...row, id: String(row.id) });
  } catch (err) {
    console.error('[assistant] Erro ao salvar anexo:', err.message);
    if (req.file?.path) try { fs.unlinkSync(req.file.path) } catch { /* ignora */ }
    res.status(500).json({ error: 'Erro ao salvar anexo' });
  }
});

// Listar anexos de uma conversa
router.get('/conversations/:id/attachments', async (req, res) => {
  try {
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    const result = await query(
      `SELECT id, filename, mime_type, file_size, created_at
       FROM assistant_attachments WHERE conversation_id = $1
       ORDER BY created_at DESC`,
      [req.params.id],
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id) })));
  } catch (err) {
    console.error('[assistant] Erro ao listar anexos:', err.message);
    res.status(500).json({ error: 'Erro ao listar anexos' });
  }
});

// Download de anexo — ACL: exige permissão na conversa, não apenas mesmo tenant
router.get('/conversations/:id/attachments/:aid', async (req, res) => {
  try {
    // Verifica acesso à conversa (participante + tenant)
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    // Defense-in-depth: anexo deve pertencer ao mesmo tenant da conversa verificada
    const att = await query(
      `SELECT a.filename, a.mime_type, a.file_path, a.tenant_id
       FROM assistant_attachments a
       WHERE a.id = $1 AND a.conversation_id = $2 AND a.tenant_id = $3`,
      [req.params.aid, req.params.id, conv.tenant_id],
    );
    if (att.rows.length === 0) return res.status(404).json({ error: 'Anexo não encontrado' });

    const a = att.rows[0];

    const filePath = path.join(attDir, a.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado' });
    res.setHeader('Content-Type', a.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${a.filename}"`);
    res.sendFile(filePath);
  } catch (err) {
    console.error('[assistant] Erro ao baixar anexo:', err.message);
    res.status(500).json({ error: 'Erro ao baixar anexo' });
  }
});

// Deletar anexo — exige permissão na conversa, não apenas mesmo tenant
router.delete('/conversations/:id/attachments/:aid', async (req, res) => {
  try {
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    // Defense-in-depth: anexo deve pertencer ao mesmo tenant da conversa verificada
    const att = await query(
      `SELECT a.file_path, a.tenant_id FROM assistant_attachments a
       WHERE a.id = $1 AND a.conversation_id = $2 AND a.tenant_id = $3`,
      [req.params.aid, req.params.id, conv.tenant_id],
    );
    if (att.rows.length === 0) return res.status(404).json({ error: 'Anexo não encontrado' });

    const a = att.rows[0];

    // Remove arquivo físico
    const filePath = path.join(attDir, a.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await query(`DELETE FROM assistant_attachments WHERE id = $1`, [req.params.aid]);
    res.json({ success: true });
  } catch (err) {
    console.error('[assistant] Erro ao deletar anexo:', err.message);
    res.status(500).json({ error: 'Erro ao deletar anexo' });
  }
});

// ===== Projetos privados e dots configuráveis (CQ-08) =====

// Helper: verifica acesso ao projeto (membro + tenant)
async function checkProjectAccess(projectId, user) {
  const tenantIds = await getAccessibleTenantIds(user);
  const result = await query(
    `SELECT p.id, p.tenant_id, p.name, p.description, p.visibility, p.color, p.created_by
     FROM assistant_projects p
     WHERE p.id = $1 AND p.tenant_id = ANY($2::int[])
       AND (
         p.visibility IN ('shared', 'internal')
         OR p.created_by = $3
         OR EXISTS (SELECT 1 FROM assistant_project_members m WHERE m.project_id = p.id AND m.user_id = $3)
       )`,
    [projectId, tenantIds, user.id],
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Listar projetos do usuário (com dot colorido)
router.get('/projects', async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query(
      `SELECT p.id, p.name, p.description, p.visibility, p.color, p.created_by,
              p.created_at, p.updated_at,
              (SELECT count(*) FROM assistant_conversations c WHERE c.project_id = p.id) AS conversation_count,
              EXISTS(SELECT 1 FROM assistant_project_members m WHERE m.project_id = p.id AND m.user_id = $2) AS is_member,
              (SELECT m.role FROM assistant_project_members m WHERE m.project_id = p.id AND m.user_id = $2) AS member_role
       FROM assistant_projects p
       WHERE p.tenant_id = ANY($1::int[])
         AND (
           p.visibility IN ('shared', 'internal')
           OR p.created_by = $2
           OR EXISTS (SELECT 1 FROM assistant_project_members m WHERE m.project_id = p.id AND m.user_id = $2)
         )
       ORDER BY p.updated_at DESC`,
      [tenantIds, req.user.id],
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id), created_by: r.created_by ? String(r.created_by) : null })));
  } catch (err) {
    console.error('[assistant] Erro ao listar projetos:', err.message);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
});

// Criar projeto
router.post('/projects', async (req, res) => {
  try {
    const { name, description, visibility, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name é obrigatório' });

    const vis = ['private', 'shared', 'internal'].includes(visibility) ? visibility : 'private';
    const dotColor = color || '#3763EB';

    const result = await query(
      `INSERT INTO assistant_projects (tenant_id, name, description, visibility, color, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, visibility, color, created_by, created_at, updated_at`,
      [req.user.tenant_id, name.trim(), description || null, vis, dotColor, req.user.id],
    );
    const row = result.rows[0];

    // Criador vira owner do projeto
    await query(
      `INSERT INTO assistant_project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [row.id, req.user.id],
    );

    res.status(201).json({ ...row, id: String(row.id), created_by: String(row.created_by), conversation_count: 0, is_member: true, member_role: 'owner' });
  } catch (err) {
    console.error('[assistant] Erro ao criar projeto:', err.message);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
});

// Atualizar projeto
router.patch('/projects/:id', async (req, res) => {
  try {
    const proj = await checkProjectAccess(req.params.id, req.user);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });

    // Apenas o criador ou owner pode editar
    if (proj.created_by !== req.user.id) {
      const member = await query(
        `SELECT role FROM assistant_project_members WHERE project_id = $1 AND user_id = $2`,
        [req.params.id, req.user.id],
      );
      if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
        return res.status(403).json({ error: 'Apenas o responsável pelo projeto pode editar' });
      }
    }

    const { name, description, visibility, color } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (visibility !== undefined && ['private', 'shared', 'internal'].includes(visibility)) {
      fields.push(`visibility = $${idx++}`); values.push(visibility);
    }
    if (color !== undefined) { fields.push(`color = $${idx++}`); values.push(color); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });

    fields.push(`updated_at = now()`);
    values.push(req.params.id);

    const result = await query(
      `UPDATE assistant_projects SET ${fields.join(', ')}
       WHERE id = $${idx++}
       RETURNING id, name, description, visibility, color, created_by, created_at, updated_at`,
      values,
    );
    const row = result.rows[0];
    res.json({ ...row, id: String(row.id), created_by: String(row.created_by) });
  } catch (err) {
    console.error('[assistant] Erro ao atualizar projeto:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
});

// Deletar projeto
router.delete('/projects/:id', async (req, res) => {
  try {
    const proj = await checkProjectAccess(req.params.id, req.user);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });

    if (proj.created_by !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Apenas o criador pode deletar o projeto' });
    }

    // Desvincula conversas do projeto antes de deletar
    await query(`UPDATE assistant_conversations SET project_id = NULL WHERE project_id = $1`, [req.params.id]);
    await query(`DELETE FROM assistant_projects WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[assistant] Erro ao deletar projeto:', err.message);
    res.status(500).json({ error: 'Erro ao deletar projeto' });
  }
});

// Listar conversas de um projeto
router.get('/projects/:id/conversations', async (req, res) => {
  try {
    const proj = await checkProjectAccess(req.params.id, req.user);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });

    const result = await query(
      `SELECT c.id, c.title, c.status, c.origin, c.conversation_kind, c.tenant_id,
              c.created_at, c.updated_at,
              (SELECT count(*) FROM assistant_messages WHERE conversation_id = c.id) AS message_count
       FROM assistant_conversations c
       WHERE c.project_id = $1
         AND c.tenant_id = ANY($2::int[])
       ORDER BY c.updated_at DESC`,
      [req.params.id, await getAccessibleTenantIds(req.user)],
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id) })));
  } catch (err) {
    console.error('[assistant] Erro ao listar conversas do projeto:', err.message);
    res.status(500).json({ error: 'Erro ao buscar conversas do projeto' });
  }
});

// Listar membros de um projeto
router.get('/projects/:id/members', async (req, res) => {
  try {
    const proj = await checkProjectAccess(req.params.id, req.user);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });

    const result = await query(
      `SELECT m.user_id, m.role, m.created_at, u.name, u.email
       FROM assistant_project_members m
       JOIN users u ON u.id = m.user_id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.id],
    );
    res.json(result.rows.map((r) => ({ ...r, user_id: String(r.user_id) })));
  } catch (err) {
    console.error('[assistant] Erro ao listar membros:', err.message);
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
});

// Adicionar membro ao projeto (owner only)
router.post('/projects/:id/members', async (req, res) => {
  try {
    const proj = await checkProjectAccess(req.params.id, req.user);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });

    // Apenas owner pode adicionar membros
    const member = await query(
      `SELECT role FROM assistant_project_members WHERE project_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Apenas o responsável pode adicionar membros' });
    }

    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id é obrigatório' });

    // Verifica que o usuário é do mesmo tenant
    const tenantIds = await getAccessibleTenantIds(req.user);
    const targetUser = await query(
      `SELECT id, name, email FROM users WHERE id = $1 AND tenant_id = ANY($2::int[])`,
      [user_id, tenantIds],
    );
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado no tenant' });
    }

    const result = await query(
      `INSERT INTO assistant_project_members (project_id, user_id, role) VALUES ($1, $2, 'member')
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = 'member'
       RETURNING user_id, role, created_at`,
      [req.params.id, user_id],
    );
    const row = result.rows[0];
    res.status(201).json({ ...row, user_id: String(row.user_id), name: targetUser.rows[0].name, email: targetUser.rows[0].email });
  } catch (err) {
    console.error('[assistant] Erro ao adicionar membro:', err.message);
    res.status(500).json({ error: 'Erro ao adicionar membro' });
  }
});

// Remover membro do projeto (owner only)
router.delete('/projects/:id/members/:userId', async (req, res) => {
  try {
    const proj = await checkProjectAccess(req.params.id, req.user);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });

    // Owner não pode remover a si mesmo
    if (String(req.user.id) === req.params.userId) {
      return res.status(400).json({ error: 'Não é possível remover o responsável' });
    }

    const member = await query(
      `SELECT role FROM assistant_project_members WHERE project_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Apenas o responsável pode remover membros' });
    }

    await query(
      `DELETE FROM assistant_project_members WHERE project_id = $1 AND user_id = $2`,
      [req.params.id, req.params.userId],
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[assistant] Erro ao remover membro:', err.message);
    res.status(500).json({ error: 'Erro ao remover membro' });
  }
});

// Atribuir conversa a um projeto (ou desatribuir com project_id null)
router.patch('/conversations/:id/project', async (req, res) => {
  try {
    const conv = await checkConversationAccess(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    const { project_id } = req.body;

    if (project_id) {
      // Verifica acesso ao projeto antes de atribuir
      const proj = await checkProjectAccess(project_id, req.user);
      if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const result = await query(
      `UPDATE assistant_conversations SET project_id = $2, updated_at = now()
       WHERE id = $1
       RETURNING id, project_id`,
      [req.params.id, project_id || null],
    );
    res.json({ ...result.rows[0], id: String(result.rows[0].id), project_id: result.rows[0].project_id ? String(result.rows[0].project_id) : null });
  } catch (err) {
    console.error('[assistant] Erro ao atribuir projeto:', err.message);
    res.status(500).json({ error: 'Erro ao atribuir projeto à conversa' });
  }
});

module.exports = router;
