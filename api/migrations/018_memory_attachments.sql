-- Migração 018 — Memória auditável e anexos privados (CQ-06)
-- Memória por escopo (user/tenant/conversation) com isolamento por tenant.
-- Anexos de conversa com ACL e validação de MIME.
BEGIN;

-- ===== assistant_memory — fatos/preferências por escopo =====
CREATE TABLE IF NOT EXISTS assistant_memory (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  conversation_id INTEGER REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('user', 'tenant', 'conversation')),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_mem_tenant ON assistant_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assistant_mem_user ON assistant_memory(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assistant_mem_conv ON assistant_memory(conversation_id) WHERE conversation_id IS NOT NULL;

-- Uma entrada por (escopo, key) dentro do mesmo tenant/user/conversation
CREATE UNIQUE INDEX IF NOT EXISTS idx_assistant_mem_unique
  ON assistant_memory(tenant_id, user_id, conversation_id, scope, key);

-- ===== assistant_attachments — arquivos anexados a conversas =====
CREATE TABLE IF NOT EXISTS assistant_attachments (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  message_id INTEGER REFERENCES assistant_messages(id) ON DELETE SET NULL,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_att_conv ON assistant_attachments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_assistant_att_tenant ON assistant_attachments(tenant_id);

COMMIT;
