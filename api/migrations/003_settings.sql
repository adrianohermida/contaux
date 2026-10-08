-- Migração 003 — Tabela de configurações (singleton) para branding persistente
BEGIN;

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'Contaux Contadoria',
  primary_color TEXT NOT NULL DEFAULT '#3763EB',
  timezone TEXT NOT NULL DEFAULT 'America/Manaus',
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  updated TIMESTAMPTZ DEFAULT now()
);

-- Garante que a linha singleton exista
INSERT INTO settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

COMMIT;
