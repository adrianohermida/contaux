-- Migração 022 — Estende CHECK constraint de event_type
-- Adiciona 'tool_result' e 'attachment' como event_types válidos em assistant_messages.
-- CQ-09: correção de erro de constraint violation descoberto na regressão.
BEGIN;

ALTER TABLE assistant_messages DROP CONSTRAINT IF EXISTS assistant_messages_event_type_check;
ALTER TABLE assistant_messages
  ADD CONSTRAINT assistant_messages_event_type_check CHECK (
    event_type IS NULL OR event_type IN (
      'handoff_requested',
      'handoff_accepted',
      'handoff_rejected',
      'conversation_closed',
      'conversation_reopened',
      'tool_result',
      'attachment'
    )
  );

COMMIT;
