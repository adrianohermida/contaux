/**
 * Rotas de autenticação — login, logout, me, gestão de usuários.
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { requireAuth, requireRole, signToken, getAccessibleTenantIds } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const result = await query(
      `SELECT u.*, t.type as tenant_type, t.name as tenant_name, t.parent_id as tenant_parent_id
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1 AND u.active = true`,
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Usuário sem senha cadastrada' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Atualiza last_login
    await query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      name: user.name,
    });

    res.json({
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_name: user.tenant_name,
        tenant_type: user.tenant_type,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ error: 'Erro ao autenticar' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const u = req.user;
  const tenantResult = await query('SELECT name, type FROM tenants WHERE id = $1', [u.tenant_id]);
  res.json({
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    tenant_id: u.tenant_id,
    tenant_name: tenantResult.rows[0]?.name || null,
    tenant_type: u.tenant_type,
  });
});

// GET /api/auth/users (admin+)
router.get('/users', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.active, u.last_login, u.tenant_id, t.name as tenant_name
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
  const { name, email, password, role, tenant_id } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password e role são obrigatórios' });
  }

  const validRoles = ['superadmin', 'admin', 'accountant', 'viewer', 'client'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role inválido' });
  }

  // admin só pode criar usuários no seu próprio tenant ou filhos
  const targetTenant = tenant_id || req.user.tenant_id;
  if (req.user.role === 'admin') {
    const tenantIds = await getAccessibleTenantIds(req.user);
    if (!tenantIds.includes(parseInt(targetTenant))) {
      return res.status(403).json({ error: 'Não pode criar usuário neste tenant' });
    }
    // admin não pode criar superadmin
    if (role === 'superadmin') {
      return res.status(403).json({ error: 'Apenas superadmin pode criar superadmins' });
    }
  }

  // Valida que o tenant existe antes de inserir
  const tenantCheck = await query('SELECT id FROM tenants WHERE id = $1', [parseInt(targetTenant)]);
  if (tenantCheck.rows.length === 0) {
    return res.status(400).json({ error: 'Tenant informado não existe' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, role, password_hash, tenant_id, active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id, name, email, role, tenant_id`,
      [name, email.toLowerCase(), role, hash, targetTenant],
    );
    const newUser = result.rows[0];

    // Envia email de convite branded — não bloqueia a criação se falhar
    const { sendMail, emailTemplates } = req.app.locals;
    if (sendMail && emailTemplates) {
      try {
        const roleLabels = { superadmin: 'super administrador', admin: 'administrador', accountant: 'contador', viewer: 'visualizador', client: 'cliente' };
        const tpl = await emailTemplates.render('invitation', {
          name,
          email: email.toLowerCase(),
          role: roleLabels[role] || role,
          tempPassword: password,
          loginUrl: `${process.env.SITE_URL || 'https://contaux.com.br'}/login`,
        });
        await sendMail({
          to: email.toLowerCase(),
          subject: tpl.subject,
          text: tpl.text,
          html: tpl.html,
        });
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

// PATCH /api/auth/users/:id
router.patch('/users/:id', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  const { name, email, role, password, active, tenant_id } = req.body;
  const sets = [];
  const vals = [];
  let idx = 1;

  if (name) { sets.push(`name = $${idx++}`); vals.push(name); }
  if (email) { sets.push(`email = $${idx++}`); vals.push(email.toLowerCase()); }
  if (role) { sets.push(`role = $${idx++}`); vals.push(role); }
  if (active !== undefined) { sets.push(`active = $${idx++}`); vals.push(active); }
  if (tenant_id !== undefined) { sets.push(`tenant_id = $${idx++}`); vals.push(tenant_id); }
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    sets.push(`password_hash = $${idx++}`); vals.push(hash);
  }

  if (sets.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });

  vals.push(req.params.id);
  try {
    const result = await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, active, tenant_id`,
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
