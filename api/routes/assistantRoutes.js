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
const { query } = require('../db');
const { requireAuth, requireRole, getAccessibleTenantIds } = require('../middleware/auth');
const { listToolsForRole, executeTool } = require('../services/assistantTools');
const { listMemories, saveMemory, deleteMemory } = require('../services/assistantMemory');
const { validateFile } = require('../services/mimeValidator');

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

    res.json(result);
  } catch (err) {
    console.error('[assistant] Erro ao executar tool:', err.message);
    res.status(500).json({ error: 'Erro ao executar tool' });
  }
});

// ===== Fila de atendimento (staff) — deve vir antes de /:id =====

// Listar conversas aguardando atendimento humano (staff only)
router.get('/conversations/queue', requireRole('admin', 'superadmin', 'accountant'), async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.title, c.status, c.origin, c.visitor_name, c.handoff_reason,
              c.created_at, c.updated_at,
              (SELECT count(*) FROM assistant_messages WHERE conversation_id = c.id AND role = 'user') AS msg_count,
              (SELECT max(created_at) FROM assistant_messages WHERE conversation_id = c.id) AS last_msg_at
       FROM assistant_conversations c
       WHERE c.status = 'waiting_human'
       ORDER BY c.updated_at ASC
       LIMIT 50`,
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id) })));
  } catch (err) {
    console.error('[assistant] Erro ao buscar fila:', err.message);
    res.status(500).json({ error: 'Erro ao buscar fila de atendimento' });
  }
});

// ===== Conversas =====

// Listar conversas do usuário (mais recentes primeiro)
router.get('/conversations', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.title, c.context, c.status, c.origin, c.assigned_to,
              c.created_at, c.updated_at,
              (SELECT count(*) FROM assistant_messages WHERE conversation_id = c.id) AS message_count
       FROM assistant_conversations c
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC
       LIMIT 50`,
      [req.user.id],
    );
    res.json(result.rows.map((r) => ({
      ...r,
      id: String(r.id),
      context: typeof r.context === 'string' ? JSON.parse(r.context) : r.context,
    })));
  } catch (err) {
    console.error('[assistant] Erro ao listar conversas:', err.message);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

// Criar nova conversa
router.post('/conversations', async (req, res) => {
  try {
    const { title, context } = req.body;
    const result = await query(
      `INSERT INTO assistant_conversations (user_id, tenant_id, title, context, origin)
       VALUES ($1, $2, $3, $4, 'internal')
       RETURNING id, title, context, status, origin, created_at, updated_at`,
      [req.user.id, req.user.tenant_id, title || 'Nova conversa', context ? JSON.stringify(context) : null],
    );
    const row = result.rows[0];

    // Adiciona o criador como participante
    await query(
      `INSERT INTO assistant_participants (conversation_id, user_id, role, display_name)
       VALUES ($1, $2, 'staff', $3)`,
      [row.id, req.user.id, req.user.name || null],
    );

    res.status(201).json({
      ...row,
      id: String(row.id),
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
    const convResult = await query(
      `SELECT c.id, c.title, c.context, c.status, c.origin, c.assigned_to,
              c.handoff_reason, c.visitor_name, c.created_at, c.updated_at
       FROM assistant_conversations c
       WHERE c.id = $1 AND (c.user_id = $2 OR c.assigned_to = $2
        OR EXISTS (SELECT 1 FROM assistant_participants p WHERE p.conversation_id = c.id AND p.user_id = $2))`,
      [req.params.id, req.user.id],
    );
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    const conv = convResult.rows[0];

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
    const { title, context } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (context !== undefined) { fields.push(`context = $${idx++}`); values.push(JSON.stringify(context)); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });

    fields.push(`updated_at = now()`);
    values.push(req.params.id, req.user.id);

    const result = await query(
      `UPDATE assistant_conversations SET ${fields.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx++}
       RETURNING id, title, context, status, origin, created_at, updated_at`,
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
    const result = await query(
      `DELETE FROM assistant_conversations WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });
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

    // Verifica acesso à conversa
    const conv = await query(
      `SELECT id, status FROM assistant_conversations
       WHERE id = $1 AND (user_id = $2 OR assigned_to = $2
        OR EXISTS (SELECT 1 FROM assistant_participants p WHERE p.conversation_id = $1 AND p.user_id = $2))`,
      [convId, req.user.id],
    );
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });
    if (conv.rows[0].status !== 'active') {
      return res.status(409).json({ error: 'Conversa não está ativa' });
    }

    await query(
      `UPDATE assistant_conversations SET status = 'waiting_human', handoff_reason = $2, updated_at = now()
       WHERE id = $1`,
      [convId, reason || null],
    );

    // Registra evento
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
router.post('/conversations/:id/accept', requireRole('admin', 'superadmin', 'accountant'), async (req, res) => {
  try {
    const convId = req.params.id;

    const conv = await query(
      `SELECT id, status FROM assistant_conversations WHERE id = $1 AND status = 'waiting_human'`,
      [convId],
    );
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada ou não aguarda atendimento' });

    await query(
      `UPDATE assistant_conversations SET status = 'with_human', assigned_to = $2, updated_at = now()
       WHERE id = $1`,
      [convId, req.user.id],
    );

    // Adiciona staff como participante se ainda não for
    await query(
      `INSERT INTO assistant_participants (conversation_id, user_id, role, display_name)
       VALUES ($1, $2, 'staff', $3)
       ON CONFLICT (conversation_id, user_id) DO NOTHING`,
      [convId, req.user.id, req.user.name || null],
    );

    // Registra evento
    await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, event_type, author_name)
       VALUES ($1, 'system', $2, 'handoff_accepted', $3)`,
      [convId, `${req.user.name || 'Atendente'} assumiu o atendimento`, req.user.name || 'Atendente'],
    );

    res.json({ success: true, status: 'with_human', assigned_to: String(req.user.id) });
  } catch (err) {
    console.error('[assistant] Erro ao aceitar handoff:', err.message);
    res.status(500).json({ error: 'Erro ao aceitar handoff' });
  }
});

// Fechar conversa (staff only)
router.post('/conversations/:id/close', requireRole('admin', 'superadmin', 'accountant'), async (req, res) => {
  try {
    const convId = req.params.id;

    const conv = await query(
      `SELECT id FROM assistant_conversations WHERE id = $1 AND assigned_to = $2`,
      [convId, req.user.id],
    );
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada ou não atribuída a você' });

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
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { role, text, sources } = req.body;
    if (!role || !text) return res.status(400).json({ error: 'role e text são obrigatórios' });
    if (!['user', 'assistant', 'system'].includes(role)) return res.status(400).json({ error: 'role inválido' });

    // Verifica acesso à conversa
    const convCheck = await query(
      `SELECT id, status FROM assistant_conversations
       WHERE id = $1 AND (user_id = $2 OR assigned_to = $2
        OR EXISTS (SELECT 1 FROM assistant_participants p WHERE p.conversation_id = $1 AND p.user_id = $2))`,
      [req.params.id, req.user.id],
    );
    if (convCheck.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });

    const result = await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, sources, author_id, author_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, role, text, sources, author_id, author_name, event_type, created_at`,
      [
        req.params.id,
        role,
        text,
        sources ? JSON.stringify(sources) : null,
        role === 'user' ? req.user.id : null,
        role === 'user' ? req.user.name : null,
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
    const convCheck = await query(
      `SELECT id FROM assistant_conversations WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (convCheck.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });

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

    const convCheck = await query(
      `SELECT id, tenant_id FROM assistant_conversations WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (convCheck.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });

    const tenantId = convCheck.rows[0].tenant_id;
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

    // Verifica acesso à conversa
    const convCheck = await query(
      `SELECT id, tenant_id FROM assistant_conversations
       WHERE id = $1 AND (user_id = $2 OR assigned_to = $2
        OR EXISTS (SELECT 1 FROM assistant_participants p WHERE p.conversation_id = $1 AND p.user_id = $2))`,
      [req.params.id, req.user.id],
    );
    if (convCheck.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });

    // Valida tenant — arquivo de outro tenant é negado
    const convTenantId = convCheck.rows[0].tenant_id;
    if (convTenantId !== req.user.tenant_id && req.user.role !== 'superadmin') {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Sem permissão para este tenant' });
    }

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
    const convCheck = await query(
      `SELECT id FROM assistant_conversations
       WHERE id = $1 AND (user_id = $2 OR assigned_to = $2
        OR EXISTS (SELECT 1 FROM assistant_participants p WHERE p.conversation_id = $1 AND p.user_id = $2))`,
      [req.params.id, req.user.id],
    );
    if (convCheck.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });

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

// Download de anexo — ACL: acesso à conversa + tenant match
router.get('/conversations/:id/attachments/:aid', async (req, res) => {
  try {
    const att = await query(
      `SELECT a.filename, a.mime_type, a.file_path, a.tenant_id, c.user_id, c.assigned_to
       FROM assistant_attachments a
       JOIN assistant_conversations c ON c.id = a.conversation_id
       WHERE a.id = $1 AND a.conversation_id = $2`,
      [req.params.aid, req.params.id],
    );
    if (att.rows.length === 0) return res.status(404).json({ error: 'Anexo não encontrado' });

    const a = att.rows[0];
    // Verifica acesso: dono, assigned, ou participante
    const hasAccess = a.user_id === req.user.id || a.assigned_to === req.user.id ||
      req.user.role === 'superadmin' || a.tenant_id === req.user.tenant_id;
    if (!hasAccess) return res.status(403).json({ error: 'Sem permissão para este anexo' });

    // Valida tenant — arquivo de outro tenant negado
    if (a.tenant_id !== req.user.tenant_id && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Anexo pertence a outro tenant' });
    }

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

// Deletar anexo
router.delete('/conversations/:id/attachments/:aid', async (req, res) => {
  try {
    const att = await query(
      `SELECT a.file_path, a.tenant_id FROM assistant_attachments a
       WHERE a.id = $1 AND a.conversation_id = $2`,
      [req.params.aid, req.params.id],
    );
    if (att.rows.length === 0) return res.status(404).json({ error: 'Anexo não encontrado' });

    const a = att.rows[0];
    if (a.tenant_id !== req.user.tenant_id && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }

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

module.exports = router;
