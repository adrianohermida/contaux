-- Correção: adiciona coluna visibility que faltava em assistant_projects
-- Causa: 021_assistant_projects.sql criou a tabela sem visibility;
--   021_projects_dots.sql usou CREATE TABLE IF NOT EXISTS (no-op) e a coluna nunca foi adicionada.
BEGIN;

ALTER TABLE assistant_projects
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'shared', 'internal'));

-- Remove índice duplicado (idx_assistant_projects_tenant e idx_projects_tenant são iguais)
DROP INDEX IF EXISTS idx_projects_tenant;

COMMIT;
