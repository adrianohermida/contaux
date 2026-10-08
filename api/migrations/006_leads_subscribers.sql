-- Migração 006 — Leads, Newsletter Subscribers e Reset de Senha
-- Tabelas para captação pública no site institucional

BEGIN;

-- ===== LEADS — captação no site =====
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_interest TEXT,
  message TEXT,
  source TEXT DEFAULT 'site',
  status TEXT NOT NULL DEFAULT 'new',  -- new | contacted | converted | lost
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- ===== NEWSLETTER SUBSCRIBERS =====
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'site',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email);

-- ===== RESET DE SENHA — colunas em users =====
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

COMMIT;
