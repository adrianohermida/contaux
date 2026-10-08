-- CQ-Projetos: tabela de projetos para agrupar conversas e tarefas
CREATE TABLE IF NOT EXISTS assistant_projects (
  id          SERIAL PRIMARY KEY,
  tenant_id   INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by  INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#3763EB',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_projects_tenant ON assistant_projects(tenant_id);

-- Permite vincular conversas a um projeto
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES assistant_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_assistant_conversations_project ON assistant_conversations(project_id);
