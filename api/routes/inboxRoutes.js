/**
 * Rotas da Caixa de Entrada — usa PostgreSQL para persistência
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { sendMail, FROM_EMAIL } = require('../services/mailService');

const WEBHOOK_KEY = process.env.CLOUDFLARE_WORKER_API_KEY || 'contaux-mail-2024';

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
    const result = await query(
      `INSERT INTO emails ("from", "to", subject, body, received_at, read, starred, folder)
       VALUES ($1, $2, $3, $4, $5, false, false, 'inbox') RETURNING *`,
      [from, to || 'contato@contaux.com.br', subject, body || '', receivedAt || new Date().toISOString()],
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
    let sql = 'SELECT * FROM emails';
    const conditions = [];
    const params = [];

    if (folder) { conditions.push(`folder = $${params.length + 1}`); params.push(folder); }
    if (unread === 'true') { conditions.push('read = false'); }
    if (starred === 'true') { conditions.push('starred = true'); }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
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
    const result = await query('SELECT * FROM emails WHERE id = $1', [req.params.id]);
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
    const sets = [];
    const params = [];

    if (read !== undefined) { sets.push(`read = $${params.length + 1}`); params.push(read); }
    if (starred !== undefined) { sets.push(`starred = $${params.length + 1}`); params.push(starred); }
    if (folder !== undefined) { sets.push(`folder = $${params.length + 1}`); params.push(folder); }

    if (sets.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    params.push(req.params.id);
    const result = await query(`UPDATE emails SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email nao encontrado' });
    res.json({ ...result.rows[0], id: String(result.rows[0].id) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar email' });
  }
});

// ===== Deletar email =====
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM emails WHERE id = $1 RETURNING id', [req.params.id]);
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

    // Armazena cópia enviada no banco
    await query(
      `INSERT INTO emails ("from", "to", subject, body, received_at, read, starred, folder)
       VALUES ($1, $2, $3, $4, now(), true, false, 'sent')`,
      [FROM_EMAIL, to, subject, text || ''],
    );

    return res.json({ success: true, method: result.method });
  } catch (err) {
    console.error('Erro ao enviar email:', err.message);
    return res.status(500).json({ error: 'Erro ao enviar email: ' + err.message });
  }
});

module.exports = router;
