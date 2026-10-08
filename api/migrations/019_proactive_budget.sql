-- Migração 019 — Proatividade interna, orçamento e kill switch (CQ-07)
-- Sugestões proativas com deduplicação, controle de orçamento por usuário,
-- e kill switch via coluna na tabela settings.
BEGIN;

-- ===== assistant_suggestions — sugestões proativas internas =====
CREATE TABLE IF NOT EXISTS assistant_suggestions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(60) NOT NULL,          -- 'overdue_invoices', 'open_tickets', 'pending_tasks', 'due_obligations'
  dedup_key VARCHAR(200) NOT NULL,    -- chave de deduplicação (type + contexto)
  title TEXT NOT NULL,
  body TEXT,
  action_url TEXT,                     -- URL para navegação
  action_label TEXT DEFAULT 'Ver',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | shown | dismissed | acted
  entity_count INTEGER DEFAULT 0,     -- contagem de itens relacionados
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  shown_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  acted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ               -- quando a sugestão deixa de ser relevante
);

CREATE INDEX IF NOT EXISTS idx_sugg_pending
  ON assistant_suggestions(tenant_id, user_id, status)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sugg_dedup
  ON assistant_suggestions(tenant_id, user_id, dedup_key, status);

-- ===== assistant_budget — controle de orçamento de tokens por usuário/dia =====
CREATE TABLE IF NOT EXISTS assistant_budget (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  requests_count INTEGER NOT NULL DEFAULT 0,
  cost_cents INTEGER NOT NULL DEFAULT 0,  -- custo em centavos
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id, period_date)
);

CREATE INDEX IF NOT EXISTS idx_budget_period ON assistant_budget(tenant_id, user_id, period_date);

-- ===== Kill switch + limite de orçamento em settings (singleton) =====
ALTER TABLE settings ADD COLUMN IF NOT EXISTS assistant_proactive_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS assistant_budget_daily_tokens INTEGER NOT NULL DEFAULT 10000;

COMMIT;
