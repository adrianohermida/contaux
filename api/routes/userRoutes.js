/**
 * Rotas de gestão de usuários e tenants — admin+.
 * Separado de authRoutes.js para manter foco e limite de linhas.
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { requireAuth, requireRole, getAccessibleTenantIds } = require('../middleware/auth');

// GET /api/auth/users (admin+)
router.get('/users', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.active, u.last_login, u.tenant_id,
              u.pin_hash IS NOT NULL as has_pin, t.name as tenant_name
       FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.tenant_id = ANY($1::int[]) ORDER BY u.id DESC`,
      [tenantIds],
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id) })));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// POST /api/auth/users (admin+)
router.post('/users', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  const { name, email, password, role, tenant_id, pin } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password e role são obrigatórios' });
  }

  const validRoles = ['superadmin', 'admin', 'accountant', 'viewer', 'client'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role inválido' });
  }

  const targetTenant = tenant_id || req.user.tenant_id;
  if (req.user.role === 'admin') {
    const tenantIds = await getAccessibleTenantIds(req.user);
    if (!tenantIds.includes(parseInt(targetTenant))) {
      return res.status(403).json({ error: 'Não pode criar usuário neste tenant' });
    }
    if (role === 'superadmin') {
      return res.status(403).json({ error: 'Apenas superadmin pode criar superadmins' });
    }
  }

  const tenantCheck = await query('SELECT id FROM tenants WHERE id = $1', [parseInt(targetTenant)]);
  if (tenantCheck.rows.length === 0) {
    return res.status(400).json({ error: 'Tenant informado não existe' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const pinHash = pin ? await bcrypt.hash(String(pin), 10) : null;
    const result = await query(
      `INSERT INTO users (name, email, role, password_hash, tenant_id, pin_hash, active)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id, name, email, role, tenant_id`,
      [name, email.toLowerCase(), role, hash, targetTenant, pinHash],
    );
    const newUser = result.rows[0];

    // Envia email de convite branded
    const { sendMail, emailTemplates } = req.app.locals;
    if (sendMail && emailTemplates) {
      try {
        const roleLabels = { superadmin: 'super administrador', admin: 'administrador', accountant: 'contador', viewer: 'visualizador', client: 'cliente' };
        const tpl = await emailTemplates.render('invitation', {
          name, email: email.toLowerCase(),
          role: roleLabels[role] || role, tempPassword: password,
          loginUrl: `${process.env.SITE_URL || 'https://contaux.com.br'}/login`,
        });
        await sendMail({ to: email.toLowerCase(), subject: tpl.subject, text: tpl.text, html: tpl.html });
      } catch (mailErr) {
        console.warn('Aviso: email de convite não enviado:', mailErr.message);
      }
    }

    res.status(201).json({ ...newUser, id: String(newUser.id) });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email já cadastrado' });
    } else {
      console.error('Erro ao criar usuário:', err.message);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
});

// PATCH /api/auth/users/:id (admin+)
router.patch('/users/:id', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  const { name, email, role, password, active, tenant_id, mfa_enabled, pin } = req.body;

  if (req.user.role === 'admin' && role === 'superadmin') {
    return res.status(403).json({ error: 'Apenas superadmin pode atribuir role superadmin' });
  }

  const sets = [];
  const vals = [];
  let idx = 1;

  if (name) { sets.push(`name = $${idx++}`); vals.push(name); }
  if (email) { sets.push(`email = $${idx++}`); vals.push(email.toLowerCase()); }
  if (role) { sets.push(`role = $${idx++}`); vals.push(role); }
  if (active !== undefined) { sets.push(`active = $${idx++}`); vals.push(active); }
  if (mfa_enabled !== undefined) { sets.push(`mfa_enabled = $${idx++}`); vals.push(mfa_enabled); }
  if (tenant_id !== undefined) { sets.push(`tenant_id = $${idx++}`); vals.push(tenant_id); }
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    sets.push(`password_hash = $${idx++}`); vals.push(hash);
  }
  if (pin !== undefined) {
    const pinHash = pin ? await bcrypt.hash(String(pin), 10) : null;
    sets.push(`pin_hash = $${idx++}`); vals.push(pinHash);
  }

  if (sets.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });

  const tenantIds = await getAccessibleTenantIds(req.user);
  vals.push(req.params.id);
  vals.push(tenantIds);
  try {
    const result = await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} AND tenant_id = ANY($${idx + 1}::int[])
       RETURNING id, name, email, role, active, mfa_enabled, tenant_id, pin_hash IS NOT NULL as has_pin`,
      vals,
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ ...result.rows[0], id: String(result.rows[0].id) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// GET /api/auth/tenants (admin+)
router.get('/tenants', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query(
      `SELECT id, name, type, parent_id, external_id, document, contact_email, active, created_at
       FROM tenants WHERE id = ANY($1::int[]) ORDER BY id DESC`,
      [tenantIds],
    );
    res.json(result.rows.map((r) => ({ ...r, id: String(r.id) })));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar tenants' });
  }
});

// POST /api/auth/tenants (superadmin only)
router.post('/tenants', requireAuth, requireRole('superadmin'), async (req, res) => {
  const { name, type, parent_id, external_id, document, contact_email } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name e type são obrigatórios' });

  try {
    const result = await query(
      `INSERT INTO tenants (name, type, parent_id, external_id, document, contact_email)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, type, parent_id || null, external_id || null, document || null, contact_email || null],
    );
    res.status(201).json({ ...result.rows[0], id: String(result.rows[0].id) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar tenant' });
  }
});

module.exports = router;
