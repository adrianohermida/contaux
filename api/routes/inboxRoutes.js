/**
 * Rotas da Caixa de Entrada — recebe emails do webhook e gerencia mensagens
 */
const express = require('express');
const router = express.Router();

const emailWorkers = require('../services/emailWorkers');

// Armazenamento em memória (substituir por DB persistente em produção)
let inbox = [];
let nextId = 1;

const WEBHOOK_KEY = process.env.CLOUDFLARE_WORKER_API_KEY || 'contaux-mail-2024';

// ===== Webhook — recebe emails do email-router Worker =====
router.post('/webhook', (req, res) => {
  const apiKey = req.headers['x-webhook-key'];
  if (apiKey !== WEBHOOK_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { from, to, subject, body, receivedAt } = req.body;

  if (!from || !subject) {
    return res.status(400).json({ error: 'from e subject sao obrigatorios' });
  }

  const email = {
    id: String(nextId++),
    from,
    to: to || 'contato@contaux.com.br',
    subject,
    body: body || '',
    receivedAt: receivedAt || new Date().toISOString(),
    read: false,
    starred: false,
    folder: 'inbox',
  };

  inbox.unshift(email);

  return res.status(201).json({ success: true, id: email.id });
});

// ===== Listar emails =====
router.get('/', (req, res) => {
  const { folder, unread, starred } = req.query;

  let result = [...inbox];

  if (folder) result = result.filter((e) => e.folder === folder);
  if (unread === 'true') result = result.filter((e) => !e.read);
  if (starred === 'true') result = result.filter((e) => e.starred);

  res.json({ emails: result, total: result.length });
});

// ===== Email individual =====
router.get('/:id', (req, res) => {
  const email = inbox.find((e) => e.id === req.params.id);
  if (!email) return res.status(404).json({ error: 'Email nao encontrado' });
  res.json(email);
});

// ===== Marcar como lido/não lido/favorito =====
router.patch('/:id', (req, res) => {
  const email = inbox.find((e) => e.id === req.params.id);
  if (!email) return res.status(404).json({ error: 'Email nao encontrado' });

  const { read, starred, folder } = req.body;
  if (read !== undefined) email.read = read;
  if (starred !== undefined) email.starred = starred;
  if (folder !== undefined) email.folder = folder;

  res.json(email);
});

// ===== Deletar email =====
router.delete('/:id', (req, res) => {
  const idx = inbox.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Email nao encontrado' });
  inbox.splice(idx, 1);
  res.json({ success: true });
});

// ===== Enviar email (via email-forwarder Worker ou SMTP) =====
router.post('/send', async (req, res) => {
  const { to, subject, text, html, replyTo } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'to e subject sao obrigatorios' });
  }

  try {
    const result = await emailWorkers.sendEmail({
      to,
      from: process.env.FROM_EMAIL || 'contato@contaux.com.br',
      subject,
      text,
      html,
      replyTo,
    });

    // Armazena cópia enviada
    inbox.unshift({
      id: String(nextId++),
      from: process.env.FROM_EMAIL || 'contato@contaux.com.br',
      to,
      subject,
      body: text || '',
      receivedAt: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'sent',
    });

    return res.json({ success: true, method: result.method || 'cloudflare-worker' });
  } catch (err) {
    console.error('Erro ao enviar email:', err.message);
    return res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

module.exports = router;
