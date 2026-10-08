-- Migração 015 — Liga tarefas a conversas do assistente (AC-GLOBAL-04)
-- Permite que o assistente proponha e crie tarefas vinculadas a uma conversa.
BEGIN;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS conversation_id INTEGER REFERENCES assistant_conversations(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
-- source: 'manual' (criada via UI de tarefas) | 'assistant' (proposta pelo assistente)

CREATE INDEX IF NOT EXISTS idx_tasks_conversation ON tasks(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by) WHERE created_by IS NOT NULL;

COMMIT;
