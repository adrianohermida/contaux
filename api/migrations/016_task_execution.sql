-- Migração 016 — Orquestração durável de tarefas (AC-GLOBAL-04)
-- Adiciona rastreabilidade de execução: log de transições de status e metadados.
BEGIN;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS execution_log jsonb DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status) WHERE status IN ('in_progress', 'todo');

COMMIT;
