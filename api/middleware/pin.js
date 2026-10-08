/**
 * Middleware requirePin — valida X-PIN-Token para operações sensíveis.
 * CQ-03: challenge de PIN de uso único com validade de 5 minutos.
 */
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { JWT_SECRET } = require('./auth');

/**
 * Valida o pin_token (JWT com nonce) enviado no header X-PIN-Token.
 * - Verifica assinatura e expiração do JWT
 * - Confere token_version para revogação de sessão
 * - Marca o nonce como usado (one-time use)
 * - Rejeita PIN expirado, reutilizado ou de sessão revogada
 */
async function requirePin(req, res, next) {
  const pinToken = req.headers['x-pin-token'];
  if (!pinToken) {
    return res.status(403).json({ error: 'Confirmação de PIN necessária para esta operação' });
  }

  let decoded;
  try {
    decoded = jwt.verify(pinToken, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'PIN expirado — confirme novamente' });
    }
    return res.status(403).json({ error: 'Token de PIN inválido' });
  }

  if (!decoded.pin_nonce) {
    return res.status(403).json({ error: 'Token de PIN inválido' });
  }

  try {
    // Busca o challenge — deve estar ativo (não usado, não expirado) e pertencer ao usuário
    const challenge = await query(
      `SELECT id, expires_at, used_at FROM pin_challenges
       WHERE nonce = $1 AND user_id = $2 AND used_at IS NULL AND expires_at > now()`,
      [decoded.pin_nonce, req.user.id],
    );

    if (challenge.rows.length === 0) {
      return res.status(403).json({ error: 'PIN já utilizado ou expirado — confirme novamente' });
    }

    // Marca como usado (one-time use)
    await query('UPDATE pin_challenges SET used_at = now() WHERE id = $1', [challenge.rows[0].id]);

    next();
  } catch (err) {
    console.error('Erro no requirePin:', err.message);
    return res.status(500).json({ error: 'Erro ao validar PIN' });
  }
}

module.exports = { requirePin };
