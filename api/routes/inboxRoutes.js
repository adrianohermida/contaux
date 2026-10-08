/**
 * Rotas da Caixa de Entrada — usa PostgreSQL para persistência
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { sendMail, FROM_EMAIL } = require('../services/mailService');
const { requireAuth, getAccessibleTenantIds } = require('../middleware/auth');

const WEBHOOK_KEY = process.env.CLOUDFLARE_WORKER_API_KEY || 'contaux-mail-2024';

// Todas as rotas exigem autenticação, exceto o webhook (usa X-Webhook-Key)
router.use((req, res, next) => {
  // Webhook tem autenticação própria via X-Webhook-Key
  if (req.path === '/webhook') return next();
  return requireAuth(req, res, next);
});

// ===== Webhook — recebe emails do email-router Worker =====
router.post('/webhook', async (req, res) => {
  const apiKey = req.headers['x-webhook-key'];
  if (apiKey !== WEBHOOK_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { from, to, subject, body, receivedAt } = req.body;

  if (!from || !subject) {
    return res.status(400).json({ error: 'from e subject sao obrigatorios' });
  }

  try {
    // Busca o tenant raiz (Contaux) para associar emails recebidos via webhook
    const tenantResult = await query("SELECT id FROM tenants WHERE name = 'Contaux Contadoria' LIMIT 1");
    const tenantId = tenantResult.rows[0]?.id || null;

    const result = await query(
      `INSERT INTO emails ("from", "to", subject, body, received_at, read, starred, folder, tenant_id)
       VALUES ($1, $2, $3, $4, $5, false, false, 'inbox', $6) RETURNING *`,
      [from, to || 'contato@contaux.com.br', subject, body || '', receivedAt || new Date().toISOString(), tenantId],
    );
    return res.status(201).json({ success: true, id: String(result.rows[0].id) });
  } catch (err) {
    console.error('Erro ao salvar email do webhook:', err.message);
    return res.status(500).json({ error: 'Erro ao salvar email' });
  }
});

// ===== Listar emails =====
router.get('/', async (req, res) => {
  try {
    const { folder, unread, starred } = req.query;
    const tenantIds = await getAccessibleTenantIds(req.user);
    let sql = 'SELECT * FROM emails';
    const conditions = [`tenant_id = ANY($1::int[])`];
    const params = [tenantIds];
    let paramIdx = 2;

    if (folder) { conditions.push(`folder = $${paramIdx++}`); params.push(folder); }
    if (unread === 'true') { conditions.push('read = false'); }
    if (starred === 'true') { conditions.push('starred = true'); }

    sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY received_at DESC';

    const result = await query(sql, params);
    const emails = result.rows.map((e) => ({ ...e, id: String(e.id) }));
    res.json({ emails, total: emails.length });
  } catch (err) {
    console.error('Erro ao listar emails:', err.message);
    res.status(500).json({ error: 'Erro ao buscar emails' });
  }
});

// ===== Email individual =====
router.get('/:id', async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query('SELECT * FROM emails WHERE id = $1 AND tenant_id = ANY($2::int[])', [req.params.id, tenantIds]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email nao encontrado' });
    res.json({ ...result.rows[0], id: String(result.rows[0].id) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar email' });
  }
});

// ===== Marcar como lido/não lido/favorito =====
router.patch('/:id', async (req, res) => {
  try {
    const { read, starred, folder } = req.body;
    const tenantIds = await getAccessibleTenantIds(req.user);
    const sets = [];
    const params = [];

    if (read !== undefined) { sets.push(`read = $${params.length + 1}`); params.push(read); }
    if (starred !== undefined) { sets.push(`starred = $${params.length + 1}`); params.push(starred); }
    if (folder !== undefined) { sets.push(`folder = $${params.length + 1}`); params.push(folder); }

    if (sets.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    params.push(req.params.id);
    params.push(tenantIds);
    const result = await query(`UPDATE emails SET ${sets.join(', ')} WHERE id = $${params.length - 1} AND tenant_id = ANY($${params.length}::int[]) RETURNING *`, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email nao encontrado' });
    res.json({ ...result.rows[0], id: String(result.rows[0].id) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar email' });
  }
});

// ===== Deletar email =====
router.delete('/:id', async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query('DELETE FROM emails WHERE id = $1 AND tenant_id = ANY($2::int[]) RETURNING id', [req.params.id, tenantIds]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email nao encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar email' });
  }
});

// ===== Enviar email (via email-forwarder Worker ou SMTP) =====
router.post('/send', async (req, res) => {
  const { to, subject, text, html, replyTo } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'to e subject sao obrigatorios' });
  }

  try {
    const result = await sendMail({ to, subject, text, html, replyTo });

    // Armazena cópia enviada no banco (com tenant_id do usuário)
    await query(
      `INSERT INTO emails ("from", "to", subject, body, received_at, read, starred, folder, tenant_id)
       VALUES ($1, $2, $3, $4, now(), true, false, 'sent', $5)`,
      [FROM_EMAIL, to, subject, text || '', req.user.tenant_id],
    );

    return res.json({ success: true, method: result.method });
  } catch (err) {
    console.error('Erro ao enviar email:', err.message);
    return res.status(500).json({ error: 'Erro ao enviar email: ' + err.message });
  }
});

module.exports = router;
