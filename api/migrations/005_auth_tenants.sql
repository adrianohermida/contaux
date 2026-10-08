-- Migração 005 — Autenticação JWT, multi-tenant hierárquico e portal do cliente
-- Cria tabela tenants, adiciona password_hash e tenant_id em users, e tenant_id em todas as tabelas de dados

BEGIN;

-- ===== TENANTS (escritórios + clientes, hierárquico) =====
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'office',     -- 'office' (Contaux, Hermida Maia) | 'client'
  parent_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,  -- client → office pai
  external_id TEXT,                         -- ID no sistema parceiro (ex: Hermida Maia)
  document TEXT,                             -- CNPJ/CPF
  contact_email TEXT,
  contact_phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenants_parent ON tenants(parent_id);
CREATE INDEX IF NOT EXISTS idx_tenants_type ON tenants(type);

-- ===== USERS: adiciona auth e tenant =====
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL;
-- role agora aceita: superadmin | admin | accountant | viewer | client
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('superadmin','admin','accountant','viewer','client'));

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- ===== TENANT_ID em todas as tabelas de dados =====
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE contact_notes ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE contact_activities ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE tax_invoices ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE obligations ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE processes ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE loyalty_programs ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE customer_points ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);

-- pgcrypto para gerar hash bcrypt no seed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===== SEED: tenant raiz Contaux + admin + Hermida Maia =====
DO $$
DECLARE
  v_contaux_id INTEGER;
  v_hermida_id INTEGER;
  v_bcrypt TEXT;
BEGIN
  -- Senha padrão: contaux123 (bcrypt via pgcrypto)
  v_bcrypt := crypt('contaux123', gen_salt('bf', 10));

  -- Tenant raiz: Contaux
  INSERT INTO tenants (name, type, document, contact_email)
  VALUES ('Contaux Contadoria', 'office', '00.000.000/0001-00', 'contato@contaux.com.br')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_contaux_id;

  IF v_contaux_id IS NULL THEN
    SELECT id INTO v_contaux_id FROM tenants WHERE name = 'Contaux Contadoria' LIMIT 1;
  END IF;

  -- Tenant parceiro: Hermida Maia
  INSERT INTO tenants (name, type, external_id, parent_id, contact_email)
  VALUES ('Hermida Maia Advocacia', 'office', 'hermida-maia-001', v_contaux_id, 'contato@hermidamaia.com.br')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_hermida_id;

  IF v_hermida_id IS NULL THEN
    SELECT id INTO v_hermida_id FROM tenants WHERE name = 'Hermida Maia Advocacia' LIMIT 1;
  END IF;

  -- Sincroniza partner_offices com tenants
  INSERT INTO partner_offices (external_id, name, api_key, contact_email)
  SELECT external_id, name, 'tx_partner_' || encode(gen_random_bytes(16), 'hex'), contact_email
  FROM tenants WHERE type = 'office' AND external_id IS NOT NULL
  ON CONFLICT (external_id) DO NOTHING;

  -- Cliente de exemplo vinculado ao tenant Contaux
  INSERT INTO clients (name, type, document, email, status, tenant_id)
  VALUES ('Empresa Exemplo Ltda', 'PJ', '11.111.111/0001-11', 'exemplo@empresa.com', 'active', v_contaux_id)
  ON CONFLICT DO NOTHING;

  -- Usuário superadmin da Contaux
  INSERT INTO users (name, email, role, password_hash, tenant_id, active)
  VALUES ('Administrador Contaux', 'admin@contaux.com.br', 'superadmin', v_bcrypt, v_contaux_id, true)
  ON CONFLICT (email) DO NOTHING;

  -- Usuário contador da Contaux
  INSERT INTO users (name, email, role, password_hash, tenant_id, active)
  VALUES ('Contador Exemplo', 'contador@contaux.com.br', 'accountant', v_bcrypt, v_contaux_id, true)
  ON CONFLICT (email) DO NOTHING;

  -- Usuário admin da Hermida Maia
  INSERT INTO users (name, email, role, password_hash, tenant_id, active)
  VALUES ('Admin Hermida Maia', 'admin@hermidamaia.com.br', 'admin', v_bcrypt, v_hermida_id, true)
  ON CONFLICT (email) DO NOTHING;
END $$;

COMMIT;
