-- Migração 001 — Schema inicial Contaux
-- Cria todas as tabelas e popula com dados de exemplo

BEGIN;

-- ===== CRM =====
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'PJ',
  document TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tags JSONB DEFAULT '[]',
  address JSONB DEFAULT '{}',
  fiscal JSONB DEFAULT '{}',
  created DATE DEFAULT CURRENT_DATE,
  updated DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  tags JSONB DEFAULT '[]',
  created DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS contact_notes (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  author TEXT DEFAULT 'Equipe Contaux',
  content TEXT NOT NULL,
  created DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS contact_activities (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created DATE DEFAULT CURRENT_DATE
);

-- ===== FINANCEIRO =====
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  issue_date DATE,
  due_date DATE,
  items JSONB DEFAULT '[]',
  discount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  issue_date DATE,
  valid_until DATE,
  items JSONB DEFAULT '[]',
  discount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT,
  client_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE,
  method TEXT NOT NULL DEFAULT 'pix',
  status TEXT NOT NULL DEFAULT 'pending',
  reference TEXT
);

-- ===== CONTABILIDADE =====
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  lines JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS tax_invoices (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL,
  model TEXT DEFAULT '55',
  series TEXT DEFAULT '1',
  issue_date DATE,
  client_name TEXT NOT NULL,
  items JSONB DEFAULT '[]',
  taxes JSONB DEFAULT '{}',
  total NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS obligations (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  type TEXT NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'pending'
);

-- ===== SUPORTE =====
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  category TEXT,
  assigned_to TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  messages JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS processes (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  process_number TEXT NOT NULL,
  court TEXT,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE,
  lawyer TEXT,
  value NUMERIC DEFAULT 0,
  notes TEXT
);

-- ===== MARKETING =====
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  audience TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  metrics JSONB DEFAULT '{"sent":0,"opened":0,"clicked":0,"converted":0}'
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  category TEXT,
  author TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_date DATE,
  views INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS loyalty_programs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_per_real INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  tier_thresholds JSONB DEFAULT '[]',
  rewards JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS customer_points (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  points_balance INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  program_id INTEGER REFERENCES loyalty_programs(id) ON DELETE SET NULL
);

-- ===== ADMINISTRAÇÃO =====
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer',
  mfa_enabled BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  "user" TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  ip TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflows (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL DEFAULT 'event',
  conditions JSONB DEFAULT '[]',
  actions JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  category TEXT,
  updated DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  format TEXT DEFAULT 'pdf',
  schedule TEXT DEFAULT 'on-demand',
  last_run DATE
);

-- ===== EMAIL (Caixa de Entrada) =====
CREATE TABLE IF NOT EXISTS emails (
  id SERIAL PRIMARY KEY,
  "from" TEXT NOT NULL,
  "to" TEXT,
  subject TEXT NOT NULL,
  body TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  folder TEXT DEFAULT 'inbox'
);

COMMIT;
