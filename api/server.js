const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/emailRoutes');
const inboxRoutes = require('./routes/inboxRoutes');
const importRoutes = require('./routes/importRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const { sendMail } = require('./services/mailService');
const emailTemplates = require('./services/emailTemplates');
const workflowEngine = require('./services/workflowEngine');
const createCrudRouter = require('./routes/crud');
const { runMigrations } = require('./migrations');

const app = express();
const PORT = 3001;

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

// Autenticação e gestão de usuários/tenants
app.use('/api/auth', authRoutes);

// Rotas públicas (site institucional: leads, newsletter, registro, reset de senha)
app.use('/api/public', publicRoutes);

// Integração com escritórios parceiros (Hermida Maia e outros)
app.use('/api/integration', integrationRoutes);

// ===== Workflow Engine — execução de automações =====
const { requireAuth } = require('./middleware/auth');

// Executa um workflow específico (gatilho manual)
app.post('/api/workflows/:id/execute', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const context = { ...req.body, triggered_by: req.user?.email || 'manual', tenant_id: req.user?.tenant_id };
    const result = await workflowEngine.executeWorkflowById(parseInt(id, 10), context);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao executar workflow: ' + err.message });
  }
});

// Dispara workflows por nome de evento
app.post('/api/workflows/trigger', requireAuth, async (req, res) => {
  try {
    const { event, ...context } = req.body;
    if (!event) return res.status(400).json({ error: 'event é obrigatório' });
    const result = await workflowEngine.triggerEvent(event, { ...context, triggered_by: req.user?.email || 'system', tenant_id: req.user?.tenant_id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao disparar evento: ' + err.message });
  }
});

// ===== Rotas CRUD (PostgreSQL) =====
const crudConfig = {
  clients:         { jsonbFields: ['tags', 'address', 'fiscal'], searchFields: ['name', 'document', 'email'] },
  contacts:        { jsonbFields: ['tags'], searchFields: ['name', 'email'] },
  contact_notes:   { searchFields: ['content', 'author'] },
  contact_activities: { searchFields: ['description'] },
  invoices:        { jsonbFields: ['items'], searchFields: ['number', 'client_name'] },
  quotes:          { jsonbFields: ['items'], searchFields: ['number', 'client_name'] },
  payments:        { searchFields: ['client_name', 'invoice_number'] },
  accounts:        { searchFields: ['code', 'name'] },
  journal_entries: { jsonbFields: ['lines'], searchFields: ['description', 'reference'] },
  tax_invoices:    { jsonbFields: ['items', 'taxes'], searchFields: ['number', 'client_name'] },
  obligations:     { searchFields: ['title', 'description'] },
  tickets:         { jsonbFields: ['messages'], searchFields: ['subject', 'client_name'] },
  processes:       { searchFields: ['client_name', 'process_number', 'subject'] },
  campaigns:       { jsonbFields: ['metrics'], searchFields: ['name', 'audience'] },
  blog_posts:      { searchFields: ['title', 'slug', 'category'] },
  loyalty_programs: { jsonbFields: ['tier_thresholds', 'rewards'], searchFields: ['name'] },
  customer_points:  { searchFields: ['client_name'] },
  users:            { searchFields: ['name', 'email'] },
  audit_logs:       { searchFields: ['user', 'action', 'details'] },
  workflows:        { jsonbFields: ['conditions', 'actions'], searchFields: ['name'] },
  documents:        { searchFields: ['name', 'category'] },
  reports:          { searchFields: ['name', 'type'] },
  emails:           { searchFields: ['subject', 'from'] },
};

for (const [table, opts] of Object.entries(crudConfig)) {
  app.use(`/api/${table}`, createCrudRouter(table, opts));
}

const TO_EMAIL = process.env.CONTACT_EMAIL || 'contato@contaux.com.br';
const FROM_EMAIL = process.env.FROM_EMAIL || 'contato@contaux.com.br';

// Disponibiliza sendMail para as rotas públicas (reset de senha, etc.)
app.locals.sendMail = sendMail;
app.locals.emailTemplates = emailTemplates;

// Endpoint do formulário de contato
app.post('/api/contact', async (req, res) => {
  const { name, subject, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios.' });
  }

  try {
    const tpl = await emailTemplates.render('contact', { name, email, phone, subject, message });
    await sendMail({ to: TO_EMAIL, subject: tpl.subject, text: tpl.text, html: tpl.html, replyTo: email });
    return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso.' });
  } catch (error) {
    console.error('Erro ao enviar email:', error.message);
    return res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente.' });
  }
});

// Endpoint de newsletter
app.post('/api/newsletter', async (req, res) => {
  const { EMAIL } = req.body;

  if (!EMAIL) {
    return res.status(400).json({ error: 'Email é obrigatório.' });
  }

  try {
    const tpl = await emailTemplates.render('newsletter', { email: EMAIL });
    await sendMail({ to: TO_EMAIL, subject: tpl.subject, text: tpl.text, html: tpl.html });
    return res.status(200).json({ success: true, message: 'Inscrição realizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar newsletter:', error.message);
    return res.status(500).json({ error: 'Erro ao registrar inscrição.' });
  }
});

// ===== Templates de email — listar, preview, teste =====

// Lista todos os templates disponíveis
app.get('/api/email/templates', (req, res) => {
  res.json({ templates: emailTemplates.listTemplates() });
});

// Preview de um template com dados de exemplo (ou fornecidos)
app.post('/api/email/templates/preview', async (req, res) => {
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
app.post('/api/email/templates/test', async (req, res) => {
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
  });
}

start();
