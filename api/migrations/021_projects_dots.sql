-- Migração 021 — Projetos privados e dots configuráveis
-- Permite organizar conversas em projetos com ACL por participante e tenant.
-- Dots = marcadores visuais (cor do projeto) aplicados às conversas.
BEGIN;

-- ===== Tabela de projetos =====
CREATE TABLE IF NOT EXISTS assistant_projects (
  id         SERIAL PRIMARY KEY,
  tenant_id  INT NOT NULL,
  name       TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'shared', 'internal')),
  color      TEXT NOT NULL DEFAULT '#3763EB',
  created_by INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== Tabela de membros do projeto (ACL) =====
CREATE TABLE IF NOT EXISTS assistant_project_members (
  id         SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES assistant_projects(id) ON DELETE CASCADE,
  user_id    INT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_projects_tenant ON assistant_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON assistant_project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON assistant_project_members(project_id);

-- ===== Coluna project_id em conversas =====
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS project_id INT REFERENCES assistant_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_conv_project ON assistant_conversations(project_id);

COMMIT;
