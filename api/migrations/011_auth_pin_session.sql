-- CQ-03: Identidade, PIN e sessão persistente
-- Adiciona PIN por usuário (para operações sensíveis) e versionamento de token (revogação).
-- Cria tabela de refresh tokens para sessão persistente via cookie httpOnly.

-- PIN por usuário (bcrypt hash, nullable — PIN é opcional)
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- Versionamento de token: incrementar para revogar todos os tokens existentes
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

-- Refresh tokens (cookie httpOnly, revogáveis individualmente)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash) WHERE revoked_at IS NULL;

-- Desafios de PIN (one-time use, com expiração)
CREATE TABLE IF NOT EXISTS pin_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nonce TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pin_challenges_nonce ON pin_challenges(nonce) WHERE used_at IS NULL;
