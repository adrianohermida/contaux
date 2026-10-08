/**
 * Middleware de autenticação para escritórios parceiros.
 * Valida o header X-Partner-Key contra a tabela partner_offices.
 * Popula req.partnerOffice com o registro do escritório.
 */
const { query } = require('../db');

async function partnerAuth(req, res, next) {
  const apiKey = req.headers['x-partner-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'Header X-Partner-Key é obrigatório' });
  }

  try {
    const result = await query(
      'SELECT * FROM partner_offices WHERE api_key = $1 AND active = true',
      [apiKey]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'API key inválida ou escritório inativo' });
    }
    req.partnerOffice = result.rows[0];
    next();
  } catch (err) {
    console.error('Erro ao validar partner key:', err.message);
    res.status(500).json({ error: 'Erro ao autenticar escritório parceiro' });
  }
}

module.exports = partnerAuth;
