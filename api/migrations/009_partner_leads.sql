-- Migração 009 — Leads de parceiros (advogados autônomos e escritórios)
-- Cadastro de interesse sem compromisso, separado de conta e adesão

BEGIN;

CREATE TABLE IF NOT EXISTS partner_leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile TEXT NOT NULL,           -- 'autonomo' | 'escritorio'
  interest TEXT[] NOT NULL DEFAULT '{}',  -- 'calculos' | 'guias' | 'contabilidade' | 'abertura'
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',  -- new | contacted | converted | lost
  linked_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_leads_email ON partner_leads(email);
CREATE INDEX IF NOT EXISTS idx_partner_leads_status ON partner_leads(status);

COMMIT;
