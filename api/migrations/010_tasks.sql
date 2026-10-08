-- Migração 010 — Tarefas (Task List)
BEGIN;

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  assigned_to TEXT,
  category TEXT,
  created DATE DEFAULT CURRENT_DATE,
  updated DATE DEFAULT CURRENT_DATE
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id);

COMMIT;
