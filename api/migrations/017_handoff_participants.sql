-- Migração 017 — Canal entre portais e atendimento humano (CQ-04)
-- Suporte a participantes múltiplos, handoff IA→humano, fila de atendimento,
-- conversas entre portais (staff ↔ cliente/visitante) e eventos de conversa.
BEGIN;

-- ===== assistant_conversations: status, handoff, origem =====
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'waiting_human', 'with_human', 'closed'));
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS handoff_reason TEXT;
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'internal'
    CHECK (origin IN ('internal', 'public'));
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS visitor_token TEXT;
ALTER TABLE assistant_conversations
  ADD COLUMN IF NOT EXISTS visitor_name TEXT;

-- Visitantes públicos não têm user_id — permite NULL
ALTER TABLE assistant_conversations ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assistant_conv_status
  ON assistant_conversations(status) WHERE status IN ('waiting_human', 'with_human');
CREATE INDEX IF NOT EXISTS idx_assistant_conv_visitor
  ON assistant_conversations(visitor_token) WHERE visitor_token IS NOT NULL;

-- ===== assistant_participants — múltiplos participantes por conversa =====
CREATE TABLE IF NOT EXISTS assistant_participants (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('staff', 'client', 'visitor')),
  display_name TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_assistant_part_conv ON assistant_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_assistant_part_user ON assistant_participants(user_id) WHERE user_id IS NOT NULL;
-- Um visitante por conversa (user_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_assistant_part_visitor
  ON assistant_participants(conversation_id) WHERE user_id IS NULL;

-- ===== assistant_messages: autoria e eventos =====
ALTER TABLE assistant_messages
  ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE assistant_messages
  ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE assistant_messages
  ADD COLUMN IF NOT EXISTS event_type TEXT
    CHECK (event_type IS NULL OR event_type IN ('handoff_requested', 'handoff_accepted', 'handoff_rejected', 'conversation_closed', 'conversation_reopened'));

-- Permite role 'system' para mensagens de evento
ALTER TABLE assistant_messages DROP CONSTRAINT IF EXISTS assistant_messages_role_check;
ALTER TABLE assistant_messages
  ADD CONSTRAINT assistant_messages_role_check CHECK (role IN ('user', 'assistant', 'system'));

COMMIT;
