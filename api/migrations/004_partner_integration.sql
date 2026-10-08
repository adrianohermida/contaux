-- Migração 004 — Integração com escritórios parceiros (Hermida Maia e outros)
-- Cria tabelas para multitenant isolation, service requests, case sync e custas

BEGIN;

-- ===== ESCRITÓRIOS PARCEIROS =====
CREATE TABLE IF NOT EXISTS partner_offices (
  id SERIAL PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,        -- office_id no app parceiro (ex: Hermida Maia)
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,             -- X-Partner-Key para autenticação
  webhook_url TEXT,                         -- URL para push de atualizações
  contact_email TEXT,
  contact_phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== SOLICITAÇÕES DE SERVIÇO =====
CREATE TABLE IF NOT EXISTS partner_service_requests (
  id SERIAL PRIMARY KEY,
  partner_office_id INTEGER REFERENCES partner_offices(id) ON DELETE CASCADE,
  external_requester_id TEXT NOT NULL,     -- ID do solicitante no app parceiro
  requester_type TEXT NOT NULL DEFAULT 'lawyer', -- 'lawyer' | 'client'
  requester_name TEXT NOT NULL,
  service_type TEXT NOT NULL,               -- 'accounting' | 'tax' | 'custas' | 'payroll' | 'consulting'
  case_number TEXT,                          -- processo relacionado (opcional)
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',   -- 'low' | 'medium' | 'high' | 'urgent'
  status TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected'
  deadline DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_psr_office ON partner_service_requests(partner_office_id);
CREATE INDEX IF NOT EXISTS idx_psr_status ON partner_service_requests(status);

-- ===== PROCESSOS SINCRONIZADOS =====
CREATE TABLE IF NOT EXISTS partner_cases (
  id SERIAL PRIMARY KEY,
  partner_office_id INTEGER REFERENCES partner_offices(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  court TEXT,
  subject TEXT,
  parties JSONB DEFAULT '[]',
  value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  publications JSONB DEFAULT '[]',
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_office_id, case_number)
);

CREATE INDEX IF NOT EXISTS idx_pc_office ON partner_cases(partner_office_id);

-- ===== PRAZOS DE CUSTAS =====
CREATE TABLE IF NOT EXISTS partner_custas (
  id SERIAL PRIMARY KEY,
  partner_office_id INTEGER REFERENCES partner_offices(id) ON DELETE CASCADE,
  partner_case_id INTEGER REFERENCES partner_cases(id) ON DELETE SET NULL,
  case_number TEXT,
  custas_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid' | 'overdue'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pcustas_office ON partner_custas(partner_office_id);
CREATE INDEX IF NOT EXISTS idx_pcustas_due ON partner_custas(due_date);
CREATE INDEX IF NOT EXISTS idx_pcustas_status ON partner_custas(status);

COMMIT;
