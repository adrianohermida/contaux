-- Migração 020 — conversation_kind: distinguir IA de atendimento
-- Separa o tipo da conversa (ai/support/internal) do canal (origin) e do status.
-- Permite classificar registros antigos sem duplicar históricos.
BEGIN;

ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS conversation_kind TEXT NOT NULL DEFAULT 'ai'
  CHECK (conversation_kind IN ('ai', 'support', 'internal'));

-- Índice composto para filtragem por tenant + kind
CREATE INDEX IF NOT EXISTS idx_assistant_conv_kind
  ON assistant_conversations(tenant_id, conversation_kind);

-- Classificar atendimentos existentes: conversas com handoff ou status de atendimento
-- são marcadas como 'support'; o restante fica como 'ai' (padrão).
UPDATE assistant_conversations
  SET conversation_kind = 'support'
  WHERE status IN ('waiting_human', 'with_human', 'closed')
    OR handoff_reason IS NOT NULL;

COMMIT;
