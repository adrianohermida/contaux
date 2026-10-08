/**
 * Middleware de autenticação JWT + isolamento multi-tenant.
 * Decodifica o token Bearer, popula req.user com { id, tenant_id, role, name, email, tenant_type }.
 */
const jwt = require('jsonwebtoken');
const { query } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não definido. O servidor não pode iniciar sem esta variável de ambiente.');
  process.exit(1);
}
const JWT_EXPIRES = '7d';

/** Gera um token JWT para um usuário */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
}

/** Middleware que exige autenticação */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Busca dados atualizados do usuário + tipo do tenant
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.tenant_id, u.client_id, u.active,
              t.type as tenant_type, t.parent_id as tenant_parent_id
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [decoded.id],
    );

    if (result.rows.length === 0 || !result.rows[0].active) {
      return res.status(401).json({ error: 'Usuário inativo ou não encontrado' });
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
 * - accountant/viewer: apenas próprio tenant
 * - client: apenas próprio tenant
 */
async function getAccessibleTenantIds(user) {
  if (user.role === 'superadmin') {
    // Superadmin vê tudo
    const result = await query('SELECT id FROM tenants');
    return result.rows.map((r) => r.id);
  }

  if (user.role === 'admin' && user.tenant_type === 'office') {
    // Admin de office vê próprio tenant + filhos
    const result = await query(
      `SELECT id FROM tenants WHERE id = $1 OR parent_id = $1`,
      [user.tenant_id],
    );
    return result.rows.map((r) => r.id);
  }

  // accountant, viewer, client: apenas próprio tenant
  return [user.tenant_id];
}

module.exports = { requireAuth, requireRole, signToken, getAccessibleTenantIds, JWT_SECRET };
