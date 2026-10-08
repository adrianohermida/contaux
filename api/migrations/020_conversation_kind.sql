-- Migração 020 — Classificação explícita de conversas (IA vs atendimento)
-- Distingue conversation_kind (ia | support) de origin (internal | public) e status.
-- Evita inferir que toda conversa interna é IA ou que todo atendimento é público.
BEGIN;

ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS conversation_kind TEXT NOT NULL DEFAULT 'ai'
    CHECK (conversation_kind IN ('ai', 'support'));

-- Classifica conversas antigas: as que já passaram por handoff são 'support'
UPDATE assistant_conversations
SET conversation_kind = 'support'
WHERE status IN ('waiting_human', 'with_human', 'closed');

CREATE INDEX IF NOT EXISTS idx_assistant_conv_kind
  ON assistant_conversations(tenant_id, conversation_kind);

COMMIT;
