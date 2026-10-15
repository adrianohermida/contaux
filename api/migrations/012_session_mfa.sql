-- Session denylist + MFA support
-- 1. revoked_jti: denylist para revogar access tokens individuais (por JTI)
-- 2. mfa_secret: segredo TOTP por usuário (base32)
-- 3. mfa_backup_codes: códigos de backup hasheados (JSON array)

-- Denylist de JTIs (access tokens revogados individualmente)
CREATE TABLE IF NOT EXISTS revoked_jti (
  jti TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para limpeza periódica (JTIs expirados podem ser removidos após 15min)
CREATE INDEX IF NOT EXISTS idx_revoked_jti_user ON revoked_jti(user_id);
CREATE INDEX IF NOT EXISTS idx_revoked_jti_time ON revoked_jti(revoked_at);

-- MFA: segredo TOTP (base32, 32 chars) e códigos de backup
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_backup_codes TEXT DEFAULT '[]';

-- Garante que mfa_enabled existe (criado em 001_schema.sql, mas pode não existir em DBs antigas)
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
