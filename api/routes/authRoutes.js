/**
 * Rotas de autenticação — login, refresh, logout, me, PIN, gestão de usuários.
 * CQ-03: sessão persistente via cookie httpOnly + refresh token + revogação.
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const {
  requireAuth, requireRole, signAccessToken, generateRefreshToken,
  getAccessibleTenantIds, JWT_SECRET, REFRESH_EXPIRES_DAYS, REFRESH_COOKIE,
} = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/** Parseia cookies do header Cookie */
function getCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  const out = {};
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name) out[name] = decodeURIComponent(rest.join('='));
  }
  return out;
}

/** Define o cookie httpOnly do refresh token */
function setRefreshCookie(res, raw) {
  res.cookie(REFRESH_COOKIE, raw, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
}

/** Limpa o cookie do refresh token */
function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: 'lax', path: '/api/auth' });
}

// POST /api/auth/login — retorna access token (15min) + seta refresh cookie (7d)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const result = await query(
      `SELECT u.*, t.type as tenant_type, t.name as tenant_name
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

    await query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);

    // Access token curto (15min)
    const accessToken = signAccessToken(user);

    // Refresh token (cookie httpOnly, 7 dias)
    const { raw, hash } = generateRefreshToken();
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + interval '${REFRESH_EXPIRES_DAYS} days')`,
      [user.id, hash],
    );
    setRefreshCookie(res, raw);

    res.json({
      token: accessToken,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_name: user.tenant_name,
        tenant_type: user.tenant_type,
        has_pin: !!user.pin_hash,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ error: 'Erro ao autenticar' });
  }
});

// POST /api/auth/refresh — troca cookie de refresh por novo access token
router.post('/refresh', async (req, res) => {
  const cookies = getCookies(req);
  const raw = cookies[REFRESH_COOKIE];
  if (!raw) return res.status(401).json({ error: 'Sem refresh token' });

  try {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');

    // Busca refresh token válido (não revogado, não expirado)
    const rtResult = await query(
      `SELECT rt.*, u.email, u.active, u.token_version
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > now()`,
      [hash],
    );

    if (rtResult.rows.length === 0) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }

    const rt = rtResult.rows[0];
    if (!rt.active) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Busca dados completos do usuário para o access token
    const userResult = await query(
      `SELECT u.*, t.type as tenant_type, t.name as tenant_name
       FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id WHERE u.id = $1`,
      [rt.user_id],
    );

    if (userResult.rows.length === 0) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];
    const accessToken = signAccessToken(user);

    res.json({
      token: accessToken,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_name: user.tenant_name,
        tenant_type: user.tenant_type,
        has_pin: !!user.pin_hash,
      },
    });
  } catch (err) {
    console.error('Erro no refresh:', err.message);
    res.status(500).json({ error: 'Erro ao renovar sessão' });
  }
});

// POST /api/auth/logout — revoga refresh token + limpa cookie + incrementa token_version
router.post('/logout', async (req, res) => {
  const cookies = getCookies(req);
  const raw = cookies[REFRESH_COOKIE];

  if (raw) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    // Revoga o refresh token específico
    await query('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1', [hash]);
    // Incrementa token_version para invalidar todos os access tokens existentes
    const rtResult = await query('SELECT user_id FROM refresh_tokens WHERE token_hash = $1', [hash]);
    if (rtResult.rows.length > 0) {
      await query('UPDATE users SET token_version = token_version + 1 WHERE id = $1', [rtResult.rows[0].user_id]);
    }
  }

  clearRefreshCookie(res);
  res.json({ success: true });
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
    has_pin: !!u.pin_hash,
  });
});

// POST /api/auth/verify-pin — verifica PIN e retorna desafio de uso único (5min)
router.post('/verify-pin', requireAuth, async (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN é obrigatório' });

  const result = await query('SELECT pin_hash FROM users WHERE id = $1', [req.user.id]);
  if (result.rows.length === 0 || !result.rows[0].pin_hash) {
    return res.status(400).json({ error: 'PIN não configurado' });
  }

  const valid = await bcrypt.compare(pin, result.rows[0].pin_hash);
  if (!valid) {
    return res.status(401).json({ error: 'PIN incorreto' });
  }

  // Cria desafio de uso único (nonce) com validade de 5 minutos
  const nonce = crypto.randomBytes(16).toString('hex');
  await query(
    `INSERT INTO pin_challenges (user_id, nonce, expires_at)
     VALUES ($1, $2, now() + interval '5 minutes')`,
    [req.user.id, nonce],
  );

  // Token curto carregando o nonce para validação no backend
  const pinToken = jwt.sign({ pin_nonce: nonce, v: req.user.token_version }, JWT_SECRET, { expiresIn: '5m' });
  res.json({ pin_token: pinToken });
});

// POST /api/auth/set-pin — usuário define ou troca seu próprio PIN
router.post('/set-pin', requireAuth, async (req, res) => {
  const { new_pin, current_pin } = req.body;
  if (!new_pin || !/^\d{4,6}$/.test(String(new_pin))) {
    return res.status(400).json({ error: 'PIN deve ter 4 a 6 dígitos numéricos' });
  }

  try {
    const result = await query('SELECT pin_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se já tem PIN, exige o PIN atual para trocar
    if (result.rows[0].pin_hash) {
      if (!current_pin) {
        return res.status(400).json({ error: 'Informe seu PIN atual para trocar' });
      }
      const valid = await bcrypt.compare(String(current_pin), result.rows[0].pin_hash);
      if (!valid) {
        return res.status(401).json({ error: 'PIN atual incorreto' });
      }
    }

    const pinHash = await bcrypt.hash(String(new_pin), 10);
    await query('UPDATE users SET pin_hash = $1 WHERE id = $2', [pinHash, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao definir PIN:', err.message);
    res.status(500).json({ error: 'Erro ao definir PIN' });
  }
});

module.exports = router;
