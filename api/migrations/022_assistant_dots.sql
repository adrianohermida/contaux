-- Migração 022 — Dots (assistentes configuráveis)
-- Cada dot tem um system_prompt customizado que substitui o prompt padrão da IA.
BEGIN;

CREATE TABLE IF NOT EXISTS assistant_dots (
  id            SERIAL PRIMARY KEY,
  tenant_id     INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by    INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  system_prompt TEXT NOT NULL DEFAULT '',
  color         TEXT DEFAULT '#3763EB',
  icon          TEXT DEFAULT 'Bot',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_dots_tenant ON assistant_dots(tenant_id);

-- Permite vincular conversas a um dot específico
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS dot_id INTEGER REFERENCES assistant_dots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_assistant_conversations_dot ON assistant_conversations(dot_id);

COMMIT;
