/**
 * Middleware de autenticação JWT + isolamento multi-tenant.
 * Decodifica o token Bearer (header ou cookie), popula req.user com { id, tenant_id, role, name, email, tenant_type }.
 * Suporta refresh tokens via cookie httpOnly e revogação por token_version.
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../db');

/** Parseia cookies do header Cookie (sem dependência externa) */
function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  const out = {};
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name) out[name] = decodeURIComponent(rest.join('='));
  }
  return out;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não definido. O servidor não pode iniciar sem esta variável de ambiente.');
  process.exit(1);
}

// Access token: curto (15min). Refresh token: 7 dias no cookie.
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES_DAYS = 7;
const REFRESH_COOKIE = 'contaux-refresh';

/** Gera um access token JWT curto com token_version para revogação */
function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id, name: user.name, v: user.token_version || 0 },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES },
  );
}

/** Gera um refresh token aleatório + seu hash SHA-256 para armazenar */
function generateRefreshToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

/** Middleware que exige autenticação — lê token do header Authorization ou cookie */
async function requireAuth(req, res, next) {
  // 1. Tenta header Authorization: Bearer <token>
  let token = null;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  }
  // 2. Sem token no header — cliente deve chamar /refresh para obter novo access token
  //    (o refresh token via cookie é tratado apenas pelo endpoint /api/auth/refresh)

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Busca dados atualizados do usuário + tipo do tenant + token_version
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.tenant_id, u.client_id, u.active, u.token_version,
              t.type as tenant_type, t.parent_id as tenant_parent_id
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [decoded.id],
    );

    if (result.rows.length === 0 || !result.rows[0].active) {
      return res.status(401).json({ error: 'Usuário inativo ou não encontrado' });
    }

    // Verifica revogação: token_version do JWT deve bater com o do usuário
    if (decoded.v !== undefined && decoded.v !== result.rows[0].token_version) {
      return res.status(401).json({ error: 'Sessão revogada' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    console.error('Erro no auth middleware:', err.message);
    return res.status(500).json({ error: 'Erro ao autenticar' });
  }
}

/** Middleware que exige um role específico (ou lista de roles) */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado para seu perfil' });
    }
    next();
  };
}

/**
 * Retorna os tenant_ids que o usuário pode acessar.
 * - superadmin/admin de office: próprio tenant + todos os filhos (clients)
 * - accountant/viewer/client: apenas próprio tenant
 */
async function getAccessibleTenantIds(user) {
  if (user.role === 'superadmin') {
    const result = await query('SELECT id FROM tenants');
    return result.rows.map((r) => r.id);
  }

  if (user.role === 'admin' && user.tenant_type === 'office') {
    const result = await query(
      `SELECT id FROM tenants WHERE id = $1 OR parent_id = $1`,
      [user.tenant_id],
    );
    return result.rows.map((r) => r.id);
  }

  return [user.tenant_id];
}

module.exports = {
  requireAuth,
  requireRole,
  signAccessToken,
  generateRefreshToken,
  getAccessibleTenantIds,
  JWT_SECRET,
  ACCESS_EXPIRES,
  REFRESH_EXPIRES_DAYS,
  REFRESH_COOKIE,
};
