/**
 * Serviço MFA/TOTP — geração de segredo, QR code e verificação.
 * Usa otplib para compatibilidade com Google Authenticator, Authy, etc.
 */
const { authenticator } = require('otplib');
const crypto = require('crypto');

/** Gera um novo segredo TOTP (base32) */
function generateSecret() {
  return authenticator.generateSecret();
}

/**
 * Gera a URI otpauth:// para o QR code.
 * Formato: otpauth://totp/Issuer:user?secret=BASE32&issuer=Issuer
 */
function generateOtpauthUri(email, secret, issuer = 'Contaux') {
  return authenticator.keyuri(email, issuer, secret);
}

/** Verifica um código TOTP de 6 dígitos */
function verifyToken(token, secret) {
  try {
    return authenticator.verify({ token: String(token), secret });
  } catch {
    return false;
  }
}

/**
 * Gera códigos de backup (10 códigos de 8 dígitos hex).
 * Retorna os códigos em texto puro (para mostrar ao usuário uma vez)
 * e seus hashes (para armazenar no banco).
 */
function generateBackupCodes() {
  const codes = [];
  const hashes = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex');
    codes.push(code);
    hashes.push(crypto.createHash('sha256').update(code).digest('hex'));
  }
  return { codes, hashes };
}

/** Verifica se um código de backup é válido e o consome (remove do array) */
function verifyBackupCode(code, storedHashes) {
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  const idx = storedHashes.indexOf(hash);
  if (idx === -1) return false;
  storedHashes.splice(idx, 1); // consome o código
  return true;
}

module.exports = {
  generateSecret,
  generateOtpauthUri,
  verifyToken,
  generateBackupCodes,
  verifyBackupCode,
};
