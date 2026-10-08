-- Migração 008 — Sincronização automática de normas (CFC) na Base de Conhecimento
BEGIN;

ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS external_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_kb_external_code ON knowledge_base (external_code) WHERE external_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS kb_sync_log (
  id SERIAL PRIMARY KEY,
  mode TEXT NOT NULL,                 -- incremental | full
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{}'
);

COMMIT;
