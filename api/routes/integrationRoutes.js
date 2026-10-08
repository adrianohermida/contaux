/**
 * Rotas de integração com escritórios parceiros (Hermida Maia e outros).
 * Multi-tenant: todas as operações são isoladas por partner_office_id.
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const partnerAuth = require('../middleware/partnerAuth');

// Middleware de auth para rotas admin (Contaux)
const adminAuth = [requireAuth, requireRole('superadmin', 'admin')];

// ===== ROTAS ADMIN (Contaux) — exigem autenticação + admin =====
// Devem vir ANTES das rotas /:id para não serem capturadas

// --- Escritórios ---

router.get('/offices', adminAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM partner_offices ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar escritórios' });
  }
});

router.post('/offices', adminAuth, async (req, res) => {
  const { external_id, name, webhook_url, contact_email, contact_phone } = req.body;
  if (!external_id || !name) {
    return res.status(400).json({ error: 'external_id e name são obrigatórios' });
  }
  const apiKey = 'tx_partner_' + require('crypto').randomBytes(16).toString('hex');
  try {
    const result = await query(
      `INSERT INTO partner_offices (external_id, name, api_key, webhook_url, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [external_id, name, apiKey, webhook_url, contact_email, contact_phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Escritório com este external_id já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao cadastrar escritório' });
    }
  }
});

router.delete('/offices/:id', adminAuth, async (req, res) => {
  try {
    const result = await query(
      'UPDATE partner_offices SET active = false, updated_at = now() WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Escritório não encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao desativar escritório' });
  }
});

router.post('/offices/:id/regenerate-key', adminAuth, async (req, res) => {
  const apiKey = 'tx_partner_' + require('crypto').randomBytes(16).toString('hex');
  try {
    const result = await query(
      'UPDATE partner_offices SET api_key = $1, updated_at = now() WHERE id = $2 RETURNING api_key',
      [apiKey, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Escritório não encontrado' });
    res.json({ api_key: result.rows[0].api_key });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao regenerar API key' });
  }
});

// --- Listar TODOS (admin) — antes de /:id ---

router.get('/service-requests/all', adminAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT sr.*, po.name as office_name FROM partner_service_requests sr
       JOIN partner_offices po ON sr.partner_office_id = po.id
       ORDER BY sr.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

router.get('/cases/all', adminAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT pc.*, po.name as office_name FROM partner_cases pc
       JOIN partner_offices po ON pc.partner_office_id = po.id
       ORDER BY pc.synced_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar processos' });
  }
});

router.get('/custas/all', adminAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT pc.*, po.name as office_name FROM partner_custas pc
       JOIN partner_offices po ON pc.partner_office_id = po.id
       ORDER BY pc.due_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar custas' });
  }
});

// --- Admin: atualizar status ---

router.patch('/service-requests/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  const validStatus = ['pending', 'accepted', 'in_progress', 'completed', 'rejected'];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  try {
    const result = await query(
      'UPDATE partner_service_requests SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Solicitação não encontrada' });

    const req_data = result.rows[0];
    const office = await query('SELECT external_id, webhook_url FROM partner_offices WHERE id = $1', [req_data.partner_office_id]);
    if (office.rows[0]?.webhook_url) {
      pushToWebhook(office.rows[0].webhook_url, {
        type: 'service_status_update',
        office_id: office.rows[0].external_id,
        data: { ticket_id: String(req_data.id), status, service_type: req_data.service_type }
      }).catch(err => console.error('Webhook push falhou:', err.message));
    }
    res.json(req_data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

router.post('/custas', adminAuth, async (req, res) => {
  const { partner_office_id, partner_case_id, case_number, custas_type, amount, due_date, notes } = req.body;
  if (!partner_office_id || !custas_type || !due_date) {
    return res.status(400).json({ error: 'partner_office_id, custas_type e due_date são obrigatórios' });
  }
  try {
    const result = await query(
      `INSERT INTO partner_custas (partner_office_id, partner_case_id, case_number, custas_type, amount, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [partner_office_id, partner_case_id, case_number, custas_type, amount || 0, due_date, notes]
    );
    const office = await query('SELECT external_id, webhook_url FROM partner_offices WHERE id = $1', [partner_office_id]);
    if (office.rows[0]?.webhook_url) {
      pushToWebhook(office.rows[0].webhook_url, {
        type: 'custas_deadline',
        office_id: office.rows[0].external_id,
        data: result.rows[0]
      }).catch(err => console.error('Webhook push falhou:', err.message));
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar prazo de custas' });
  }
});

router.patch('/custas/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'paid', 'overdue'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  try {
    const result = await query(
      'UPDATE partner_custas SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Custas não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar custas' });
  }
});

// ===== ROTAS PROTEGIDAS (requer X-Partner-Key) =====

// --- Solicitações de Serviço ---

router.post('/service-requests', partnerAuth, async (req, res) => {
  const office = req.partnerOffice;
  const { external_requester_id, requester_type, requester_name, service_type, case_number, description, priority, deadline, metadata } = req.body;
  if (!external_requester_id || !requester_name || !service_type || !description) {
    return res.status(400).json({ error: 'external_requester_id, requester_name, service_type e description são obrigatórios' });
  }
  try {
    const result = await query(
      `INSERT INTO partner_service_requests
        (partner_office_id, external_requester_id, requester_type, requester_name, service_type, case_number, description, priority, deadline, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [office.id, external_requester_id, requester_type || 'lawyer', requester_name, service_type, case_number, description, priority || 'medium', deadline, JSON.stringify(metadata || {})]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar solicitação:', err.message);
    res.status(500).json({ error: 'Erro ao criar solicitação de serviço' });
  }
});

router.get('/service-requests/:id', partnerAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM partner_service_requests WHERE id = $1 AND partner_office_id = $2',
      [req.params.id, req.partnerOffice.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Solicitação não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar solicitação' });
  }
});

router.get('/service-requests', partnerAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM partner_service_requests WHERE partner_office_id = $1 ORDER BY id DESC',
      [req.partnerOffice.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// --- Processos ---

router.post('/cases', partnerAuth, async (req, res) => {
  const office = req.partnerOffice;
  const { case_number, court, subject, parties, value, status, publications } = req.body;
  if (!case_number) {
    return res.status(400).json({ error: 'case_number é obrigatório' });
  }
  try {
    const existing = await query(
      'SELECT id FROM partner_cases WHERE partner_office_id = $1 AND case_number = $2',
      [office.id, case_number]
    );
    let result;
    if (existing.rows.length > 0) {
      result = await query(
        `UPDATE partner_cases SET court = $1, subject = $2, parties = $3, value = $4, status = $5, publications = $6, synced_at = now()
         WHERE id = $7 RETURNING *`,
        [court, subject, JSON.stringify(parties || []), value || 0, status || 'active', JSON.stringify(publications || []), existing.rows[0].id]
      );
    } else {
      result = await query(
        `INSERT INTO partner_cases (partner_office_id, case_number, court, subject, parties, value, status, publications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [office.id, case_number, court, subject, JSON.stringify(parties || []), value || 0, status || 'active', JSON.stringify(publications || [])]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao sincronizar processo:', err.message);
    res.status(500).json({ error: 'Erro ao sincronizar processo' });
  }
});

router.get('/cases', partnerAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM partner_cases WHERE partner_office_id = $1 ORDER BY synced_at DESC',
      [req.partnerOffice.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar processos' });
  }
});

// --- Custas (partner) ---

router.get('/custas', partnerAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM partner_custas WHERE partner_office_id = $1 ORDER BY due_date ASC',
      [req.partnerOffice.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar custas' });
  }
});

// --- Push de atualização ---

async function pushToWebhook(webhookUrl, payload) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Webhook retornou ${response.status}`);
  }
  return response;
}

module.exports = router;
