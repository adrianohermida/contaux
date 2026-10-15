const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/emailRoutes');
const inboxRoutes = require('./routes/inboxRoutes');
const importRoutes = require('./routes/importRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const publicRoutes = require('./routes/publicRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const taskRoutes = require('./routes/taskRoutes');
const googleRoutes = require('./routes/googleRoutes');
const { sendMail } = require('./services/mailService');
const emailTemplates = require('./services/emailTemplates');
const workflowEngine = require('./services/workflowEngine');
const createCrudRouter = require('./routes/crud');
const { runMigrations } = require('./migrations');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// ===== Upload de PDFs — Base de Conhecimento =====
const uploadsDir = path.join(__dirname, 'uploads');
const kbPublicDir = path.join(uploadsDir, 'public');
const kbPrivateDir = path.join(uploadsDir, 'private');
if (!fs.existsSync(kbPublicDir)) fs.mkdirSync(kbPublicDir, { recursive: true });
if (!fs.existsSync(kbPrivateDir)) fs.mkdirSync(kbPrivateDir, { recursive: true });

const kbStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const vis = req.body.visibility || 'private';
    cb(null, vis === 'public' ? kbPublicDir : kbPrivateDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const kbUpload = multer({ storage: kbStorage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas de gerenciamento de email (Cloudflare)
app.use('/api/email', emailRoutes);

// Rotas da caixa de entrada (inbox)
app.use('/api/inbox', inboxRoutes);

// Rotas de importação em massa
app.use('/api/import', importRoutes);

// Configurações de branding (singleton)
app.use('/api/settings', settingsRoutes);

// Autenticação (login, refresh, logout, me, PIN)
app.use('/api/auth', authRoutes);
// Gestão de usuários e tenants (admin+)
app.use('/api/auth', userRoutes);

// Estatísticas agregadas (dashboard e segurança)
app.use('/api/stats', statsRoutes);

// Rotas públicas (site institucional: leads, newsletter, registro, reset de senha)
app.use('/api/public', publicRoutes);

// Integração com escritórios parceiros (Hermida Maia e outros)
app.use('/api/integration', integrationRoutes);

// Assistente — conversas persistentes (AC-GLOBAL-02)
app.use('/api/assistant', assistantRoutes);

// Orquestração de tarefas — transições de status com log durável (AC-GLOBAL-04)
app.use('/api/tasks-orchestration', taskRoutes);

// Integrações Google (Calendar, Drive, Tasks, Sheets, Docs, Forms, Ads)
app.use('/api/google', googleRoutes);

// ===== Workflow Engine — execução de automações =====
const { requireAuth, getAccessibleTenantIds } = require('./middleware/auth');

// Executa um workflow específico (gatilho manual)
// SEC-09: verifica tenant, active e papel antes de executar
app.post('/api/workflows/:id/execute', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // SEC-09: client e viewer não podem executar workflows
    if (req.user.role === 'client' || req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Seu perfil não pode executar workflows' });
    }
    // SEC-09: workflow deve pertencer ao tenant do usuário e estar ativo
    const tenantIds = await getAccessibleTenantIds(req.user);
    const wfCheck = await query(
      'SELECT id, active FROM workflows WHERE id = $1 AND tenant_id = ANY($2::int[])',
      [parseInt(id, 10), tenantIds],
    );
    if (wfCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow não encontrado' });
    }
    if (!wfCheck.rows[0].active) {
      return res.status(403).json({ error: 'Workflow inativo' });
    }
    const context = { ...req.body, triggered_by: req.user?.email || 'manual', tenant_id: req.user?.tenant_id };
    const result = await workflowEngine.executeWorkflowById(parseInt(id, 10), context);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao executar workflow: ' + err.message });
  }
});

// Dispara workflows por nome de evento
// SEC-09: client e viewer não podem disparar eventos
app.post('/api/workflows/trigger', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'client' || req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Seu perfil não pode disparar workflows' });
    }
    const { event, ...context } = req.body;
    if (!event) return res.status(400).json({ error: 'event é obrigatório' });
    const result = await workflowEngine.triggerEvent(event, { ...context, triggered_by: req.user?.email || 'system', tenant_id: req.user?.tenant_id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao disparar evento: ' + err.message });
  }
});

// ===== Base de Conhecimento — Upload e servir PDFs =====
app.post('/api/knowledge-base/upload', requireAuth, kbUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const vis = req.body.visibility || 'private';
  res.json({
    file_url: `/api/knowledge-base/files/${vis}/${req.file.filename}`,
    file_name: req.file.originalname,
  });
});

app.get('/api/knowledge-base/files/public/:filename', (req, res) => {
  const filePath = path.join(kbPublicDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado' });
  res.sendFile(filePath);
});

// SEC-04: Download de arquivo privado — resolve documento por file_url, verifica tenant
app.get('/api/knowledge-base/files/private/:filename', requireAuth, async (req, res) => {
  try {
    const fileUrl = `/api/knowledge-base/files/private/${req.params.filename}`;
    // Resolve o item da base de conhecimento pelo file_url
    const kbResult = await query(
      `SELECT id, tenant_id, visibility FROM knowledge_base WHERE file_url = $1 LIMIT 1`,
      [fileUrl],
    );

    if (kbResult.rows.length === 0) {
      // Sem registro na KB — falha fechada: não serve arquivo sem autorização
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const kbItem = kbResult.rows[0];

    // Se o item é público, qualquer autenticado pode acessar
    if (kbItem.visibility !== 'public') {
      // Item privado — verifica acesso ao tenant
      const tenantIds = await getAccessibleTenantIds(req.user);
      if (kbItem.tenant_id !== null && !tenantIds.includes(kbItem.tenant_id)) {
        // Negação indistinguível de "não encontrado" — não vaza existência
        return res.status(404).json({ error: 'Arquivo não encontrado' });
      }
    }

    const filePath = path.join(kbPrivateDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado' });
    res.sendFile(filePath);
  } catch (err) {
    console.error('Erro ao servir arquivo privado:', err.message);
    res.status(500).json({ error: 'Erro ao servir arquivo' });
  }
});

// ===== Base de Conhecimento — Assistente de IA =====
const aiService = require('./services/aiService');
const { recordUsage, getBudgetStatus } = require('./services/assistantProactive');
const { checkConversationAccess } = require('./services/conversationAccess');
const { query } = require('./db');
app.post('/api/knowledge-base/ask', requireAuth, async (req, res) => {
  const { question, conversation_id } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Pergunta é obrigatória' });
  }
  try {
    // Verifica orçamento antes de processar
    const budget = await getBudgetStatus(req.user.id, req.user.tenant_id);
    if (budget.budget_exceeded) {
      return res.status(429).json({
        error: 'Orçamento diário do assistente excedido. Tente novamente amanhã.',
        budget,
      });
    }

    const tenantIds = await getAccessibleTenantIds(req.user);

    // C-12/P0: autorização canônica antes de ler histórico, chamar IA ou escrever.
    // Usa checkConversationAccess (participante + tenant) — não aceita conversation_id forjado.
    // Erros não revelam existência de conversa estrangeira (404 genérico).
    let convDotId = null;
    if (conversation_id) {
      const conv = await checkConversationAccess(conversation_id, req.user);
      if (!conv) {
        return res.status(404).json({ error: 'Conversa não encontrada' });
      }
      // IA não processa conversas em atendimento humano
      if (conv.status === 'with_human' || conv.status === 'waiting_human') {
        return res.status(409).json({ error: 'Conversa em atendimento humano' });
      }
      // C-12: deriva Dot do vínculo governado (conversation.dot_id), não do body.
      // O dot_id da conversa foi validado no momento da criação (tenant + is_active).
      convDotId = conv.dot_id || null;
    }

    // Busca histórico da conversa atual (últimas 20 mensagens) para contexto da IA
    // C-14: janela recente correta — DESC LIMIT 20 depois reordena ASC
    let conversationHistory = [];
    if (conversation_id) {
      const histResult = await query(
        `SELECT role, text FROM (
           SELECT role, text, created_at FROM assistant_messages
           WHERE conversation_id = $1 AND role IN ('user', 'assistant')
           ORDER BY created_at DESC
           LIMIT 20
         ) recent
         ORDER BY created_at ASC`,
        [conversation_id],
      );
      conversationHistory = histResult.rows;
    }

    // C-12: busca system_prompt do Dot derivado da conversa (vínculo governado).
    // Não confia no dot_id do body — usa o dot_id da conversa autorizada.
    let systemPrompt = null;
    if (convDotId) {
      const dotResult = await query(
        `SELECT system_prompt FROM assistant_dots WHERE id = $1 AND tenant_id = ANY($2::int[]) AND is_active = true`,
        [convDotId, tenantIds],
      );
      if (dotResult.rows.length > 0) systemPrompt = dotResult.rows[0].system_prompt;
    }

    const result = await aiService.ask(question.trim(), { tenantIds, conversationHistory, systemPrompt });

    // Salva mensagens no servidor (autoria definida pelo servidor, não pelo cliente)
    let savedMessages = null;
    if (conversation_id) {
      // Salva a pergunta do usuário
      const userMsg = await query(
        `INSERT INTO assistant_messages (conversation_id, role, text, author_id, author_name)
         VALUES ($1, 'user', $2, $3, $4)
         RETURNING id, role, text, author_id, author_name, created_at`,
        [conversation_id, question.trim(), req.user.id, req.user.name],
      );

      // Salva a resposta da IA
      const aiMsg = await query(
        `INSERT INTO assistant_messages (conversation_id, role, text, sources, author_name)
         VALUES ($1, 'assistant', $2, $3, 'Assistente')
         RETURNING id, role, text, sources, author_name, created_at`,
        [conversation_id, result.answer, result.sources ? JSON.stringify(result.sources) : null],
      );

      await query(`UPDATE assistant_conversations SET updated_at = now() WHERE id = $1`, [conversation_id]);

      savedMessages = {
        user: { ...userMsg.rows[0], id: String(userMsg.rows[0].id) },
        assistant: {
          ...aiMsg.rows[0],
          id: String(aiMsg.rows[0].id),
          sources: typeof aiMsg.rows[0].sources === 'string' ? JSON.parse(aiMsg.rows[0].sources) : aiMsg.rows[0].sources,
        },
      };
    }

    // C-11/P1: usa tokens reais do OpenAI quando disponíveis; estimativa como fallback.
    const realTokens = result.tokenUsage?.total_tokens || null;
    const estimatedTokens = result.configured ? 500 : 200;
    const tokensToRecord = realTokens !== null ? realTokens : estimatedTokens;
    const tokenSource = realTokens !== null ? 'actual' : 'estimated';
    await recordUsage(req.user.id, req.user.tenant_id, tokensToRecord, 0);

    res.json({
      ...result,
      budget: { ...budget, tokens_used: budget.tokens_used + tokensToRecord },
      token_source: tokenSource,
      savedMessages,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro ao consultar o assistente' });
  }
});

// ===== Base de Conhecimento — sincronização das NBCs (CFC) =====
const cfcSync = require('./services/cfcSync');
const { requireRole } = require('./middleware/auth');
app.post('/api/knowledge-base/sync', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  res.json(await cfcSync.run(req.body?.mode === 'full' ? 'full' : 'incremental'));
});
app.get('/api/knowledge-base/sync/status', requireAuth, async (req, res) => res.json(await cfcSync.status()));

// ===== Rotas CRUD (PostgreSQL) =====
const crudConfig = {
  clients:         { jsonbFields: ['tags', 'address', 'fiscal'], searchFields: ['name', 'document', 'email'], editableFields: ['name', 'type', 'document', 'email', 'phone', 'status', 'tags', 'address', 'fiscal'] },
  contacts:        { jsonbFields: ['tags'], searchFields: ['name', 'email'], editableFields: ['name', 'email', 'phone', 'position', 'client_id', 'tags'] },
  contact_notes:   { searchFields: ['content', 'author'], editableFields: ['contact_id', 'author', 'content'] },
  contact_activities: { searchFields: ['description'], editableFields: ['contact_id', 'type', 'description'] },
  invoices:        { jsonbFields: ['items'], searchFields: ['number', 'client_name'], pinProtectedDelete: true, editableFields: ['number', 'client_name', 'issue_date', 'due_date', 'items', 'discount', 'status', 'notes'] },
  quotes:          { jsonbFields: ['items'], searchFields: ['number', 'client_name'], editableFields: ['number', 'client_name', 'issue_date', 'valid_until', 'items', 'discount', 'status'] },
  payments:        { searchFields: ['client_name', 'invoice_number'], pinProtectedDelete: true, editableFields: ['invoice_number', 'client_name', 'amount', 'payment_date', 'method', 'status', 'reference'] },
  accounts:        { searchFields: ['code', 'name'], editableFields: ['code', 'name', 'type', 'parent_id', 'level', 'active'] },
  journal_entries: { jsonbFields: ['lines'], searchFields: ['description', 'reference'], pinProtectedDelete: true, editableFields: ['date', 'description', 'reference', 'status', 'lines'] },
  tax_invoices:    { jsonbFields: ['items', 'taxes'], searchFields: ['number', 'client_name'], pinProtectedDelete: true, editableFields: ['number', 'model', 'series', 'issue_date', 'client_name', 'items', 'taxes', 'total', 'status'] },
  obligations:     { searchFields: ['title', 'description'], editableFields: ['title', 'description', 'due_date', 'type', 'frequency', 'status'] },
  tickets:         { jsonbFields: ['messages'], searchFields: ['subject', 'client_name'], editableFields: ['client_name', 'subject', 'description', 'priority', 'status', 'category', 'assigned_to', 'messages'] },
  processes:       { searchFields: ['client_name', 'process_number', 'subject'], editableFields: ['client_name', 'process_number', 'court', 'subject', 'status', 'start_date', 'lawyer', 'value', 'notes'] },
  campaigns:       { jsonbFields: ['metrics'], searchFields: ['name', 'audience'], editableFields: ['name', 'channel', 'audience', 'status', 'start_date', 'end_date', 'metrics'] },
  blog_posts:      { searchFields: ['title', 'slug', 'category'], editableFields: ['title', 'slug', 'excerpt', 'category', 'author', 'status', 'published_date', 'views'] },
  loyalty_programs: { jsonbFields: ['tier_thresholds', 'rewards'], searchFields: ['name'], editableFields: ['name', 'description', 'points_per_real', 'active', 'tier_thresholds', 'rewards'] },
  customer_points:  { searchFields: ['client_name'], editableFields: ['client_name', 'points_balance', 'tier', 'program_id'] },
  audit_logs:       { searchFields: ['user', 'action', 'details'], allowedRoles: ['superadmin', 'admin'], editableFields: [], writeRoles: [], noTenant: true },
  workflows:        { jsonbFields: ['conditions', 'actions'], searchFields: ['name'], editableFields: ['name', 'trigger', 'conditions', 'actions', 'active'] },
  documents:        { searchFields: ['name', 'category'], editableFields: ['name', 'type', 'category'] },
  reports:          { searchFields: ['name', 'type'], editableFields: ['name', 'type', 'format', 'schedule', 'last_run'] },
  emails:           { searchFields: ['subject', 'from'], editableFields: [], writeRoles: [] },
  knowledge_base:   { jsonbFields: ['tags'], searchFields: ['title', 'summary', 'content', 'author'], includeNullTenant: true, editableFields: ['title', 'type', 'content', 'summary', 'tags', 'file_url', 'file_name', 'visibility', 'author', 'source', 'status'] },
  tasks:             { searchFields: ['title', 'assigned_to'], editableFields: ['title', 'description', 'status', 'priority', 'due_date', 'assigned_to', 'category'] },
};

for (const [table, opts] of Object.entries(crudConfig)) {
  app.use(`/api/${table}`, createCrudRouter(table, opts));
}

const TO_EMAIL = process.env.CONTACT_EMAIL || 'contato@contaux.com.br';
const FROM_EMAIL = process.env.FROM_EMAIL || 'contato@contaux.com.br';

// Disponibiliza sendMail para as rotas públicas (reset de senha, etc.)
app.locals.sendMail = sendMail;
app.locals.emailTemplates = emailTemplates;

// Endpoint do formulário de contato — persiste no banco e envia email (PUB-06)
app.post('/api/contact', async (req, res) => {
  const { name, subject, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios.' });
  }

  try {
    // Persiste no banco antes de confirmar recebimento (PUB-06: persistência real)
    await query(
      `INSERT INTO leads (name, email, phone, service_interest, message, source)
       VALUES ($1, $2, $3, $4, $5, 'contact')`,
      [name.trim(), email.toLowerCase().trim(), phone || null, subject || null, message.trim()],
    );

    // Envia email de notificação — não bloqueia a resposta se falhar
    try {
      const tpl = await emailTemplates.render('contact', { name, email, phone, subject, message });
      await sendMail({ to: TO_EMAIL, subject: tpl.subject, text: tpl.text, html: tpl.html, replyTo: email });
    } catch (mailErr) {
      console.warn('Aviso: email de contato não enviado, mas mensagem foi persistida:', mailErr.message);
    }

    return res.status(200).json({ success: true, message: 'Mensagem registrada com sucesso. Entraremos em contato em até 1 dia útil.' });
  } catch (error) {
    console.error('Erro ao registrar contato:', error.message);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Parece que já recebemos sua mensagem. Em breve entraremos em contato.' });
    }
    return res.status(503).json({ error: 'Serviço indisponível no momento. Tente novamente em alguns instantes ou nos contate diretamente.' });
  }
});

// ===== Templates de email — listar, preview, teste =====

// Lista todos os templates disponíveis
app.get('/api/email/templates', requireAuth, (req, res) => {
  res.json({ templates: emailTemplates.listTemplates() });
});

// Preview de um template com dados de exemplo (ou fornecidos)
app.post('/api/email/templates/preview', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  const { template, data } = req.body;
  if (!template) return res.status(400).json({ error: 'template é obrigatório' });
  try {
    const tpl = await emailTemplates.render(template, data || emailTemplates.SAMPLE_DATA[template] || {});
    res.json({ subject: tpl.subject, html: tpl.html, text: tpl.text });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Envia email de teste para o próprio endereço
app.post('/api/email/templates/test', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  const { template, to } = req.body;
  if (!template || !to) return res.status(400).json({ error: 'template e to são obrigatórios' });
  try {
    const tpl = await emailTemplates.render(template, emailTemplates.SAMPLE_DATA[template] || {});
    await sendMail({ to, subject: `[TESTE] ${tpl.subject}`, text: tpl.text, html: tpl.html });
    res.json({ success: true, message: 'Email de teste enviado.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar teste: ' + err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    email: {
      cloudflare: {
        configured: !!(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID),
      },
      smtp: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      },
    },
  });
});

// Middleware de erro — captura JSON malformado do body-parser
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
  }
  next(err);
});

// Inicia após rodar migrações
async function start() {
  try {
    await runMigrations();
  } catch (err) {
    console.error('Erro ao rodar migrações:', err.message);
    // Continua mesmo com erro — o DB pode estar inicializando
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Contaux API rodando na porta ${PORT}`);
    cfcSync.schedule();
  });
}

start();
