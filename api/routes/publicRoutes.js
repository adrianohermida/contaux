/**
 * Rotas públicas — leads, newsletter, registro de conta e reset de senha.
 * Acessíveis sem autenticação (site institucional).
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../db');
const { signToken, JWT_SECRET } = require('../middleware/auth');

// ===== LEADS — captação no site =====
router.post('/leads', async (req, res) => {
  const { name, email, phone, service_interest, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    await query(
      `INSERT INTO leads (name, email, phone, service_interest, message, source)
       VALUES ($1, $2, $3, $4, $5, 'site')`,
      [name, email.toLowerCase(), phone || null, service_interest || null, message || null],
    );
    res.status(201).json({ success: true, message: 'Lead registrado com sucesso' });
  } catch (err) {
    console.error('Erro ao registrar lead:', err.message);
    res.status(500).json({ error: 'Erro ao registrar lead' });
  }
});

// ===== NEWSLETTER — subscribe com persistência =====
router.post('/newsletter', async (req, res) => {
  const { email, name } = req.body;
  const EMAIL = (email || '').toLowerCase().trim();
  if (!EMAIL) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    await query(
      `INSERT INTO newsletter_subscribers (email, name, source)
       VALUES ($1, $2, 'site')
       ON CONFLICT (email) DO UPDATE SET active = true`,
      [EMAIL, name || null],
    );
    res.json({ success: true, message: 'Inscrição realizada com sucesso' });
  } catch (err) {
    console.error('Erro ao registrar newsletter:', err.message);
    res.status(500).json({ error: 'Erro ao registrar inscrição' });
  }
});

// ===== REGISTRO DE NOVA CONTA (cliente) =====
router.post('/register', async (req, res) => {
  const { name, email, password, phone, company_name, document } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
  }

  try {
    // Verifica email duplicado
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Busca tenant raiz Contaux (office)
    const contaux = await query("SELECT id FROM tenants WHERE name = 'Contaux Contadoria' LIMIT 1");
    const parentTenantId = contaux.rows[0]?.id || null;

    // Cria tenant cliente vinculado à Contaux
    const tenantResult = await query(
      `INSERT INTO tenants (name, type, parent_id, document, contact_email, contact_phone)
       VALUES ($1, 'client', $2, $3, $4, $5) RETURNING id`,
      [company_name || name, parentTenantId, document || null, email.toLowerCase(), phone || null],
    );
    const tenantId = tenantResult.rows[0].id;

    // Cria usuário cliente
    const hash = await bcrypt.hash(password, 10);
    const userResult = await query(
      `INSERT INTO users (name, email, role, password_hash, tenant_id, active)
       VALUES ($1, $2, 'client', $3, $4, true) RETURNING id, name, email, role, tenant_id`,
      [name, email.toLowerCase(), hash, tenantId],
    );

    const user = userResult.rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id, name: user.name });

    // Envia email de boas-vindas branded — não bloqueia o registro se falhar
    const { sendMail, emailTemplates } = req.app.locals;
    if (sendMail && emailTemplates) {
      try {
        const tpl = await emailTemplates.render('welcome', {
          name: user.name,
          loginUrl: `${process.env.SITE_URL || 'https://contaux.com.br'}/login`,
        });
        await sendMail({
          to: email.toLowerCase(),
          subject: tpl.subject,
          text: tpl.text,
          html: tpl.html,
        });
      } catch (mailErr) {
        console.warn('Aviso: email de boas-vindas não enviado:', mailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      token,
      user: { id: String(user.id), name: user.name, email: user.email, role: user.role, tenant_id: user.tenant_id },
    });
  } catch (err) {
    console.error('Erro ao registrar conta:', err.message);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// ===== ESQUECI MINHA SENHA =====
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    const result = await query('SELECT id, name FROM users WHERE email = $1 AND active = true', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      // Não revela se o email existe ou não
      return res.json({ success: true, message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha' });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, expires, user.id],
    );

    // Envia email branded com link de reset — não bloqueia se falhar
    const resetUrl = `${process.env.SITE_URL || 'https://contaux.com.br'}/reset-password.html?token=${token}`;
    const { sendMail, emailTemplates } = req.app.locals;
    if (sendMail && emailTemplates) {
      try {
        const tpl = await emailTemplates.render('password_reset', { name: user.name, resetUrl });
        await sendMail({
          to: email.toLowerCase(),
          subject: tpl.subject,
          text: tpl.text,
          html: tpl.html,
        });
      } catch (mailErr) {
        console.warn('Aviso: email de reset não enviado:', mailErr.message);
      }
    }

    res.json({ success: true, message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha' });
  } catch (err) {
    console.error('Erro ao solicitar reset:', err.message);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// ===== REDEFINIR SENHA =====
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
  }

  try {
    const result = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > now() AND active = true',
      [token],
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hash = await bcrypt.hash(password, 10);
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hash, result.rows[0].id],
    );

    res.json({ success: true, message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err.message);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

module.exports = router;
