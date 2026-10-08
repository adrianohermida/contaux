-- Migração 007 — Base de Conhecimento
-- Repositório de artigos, legislação, livros/PDFs e FAQs
-- Fonte de inteligência para assistentes de IA e nutrição de todos os módulos

BEGIN;

CREATE TABLE IF NOT EXISTS knowledge_base (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'article',       -- article | legislation | book | faq
  content TEXT DEFAULT '',                     -- corpo do texto (artigos, FAQs)
  summary TEXT DEFAULT '',                     -- resumo curto para listagem
  tags JSONB DEFAULT '[]',                      -- tags de área: Tributário, Trabalhista, Societário, Fiscal, Contábil, LGPD
  file_url TEXT,                               -- URL do PDF (para livros/legislação)
  file_name TEXT,                              -- nome original do arquivo
  visibility TEXT NOT NULL DEFAULT 'private',  -- private | public
  author TEXT,
  source TEXT,                                  -- ex: "Lei 13.709/2018", "Editora Atlas, 2023"
  status TEXT NOT NULL DEFAULT 'draft',        -- draft | published
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para busca full-text no título e resumo
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON knowledge_base USING gin (to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(content,'')));

-- Dados de exemplo
INSERT INTO knowledge_base (title, type, summary, content, tags, author, source, status, visibility) VALUES
('Guia de Tributação para MEI', 'article', 'Resumo das obrigações tributárias do Microempreendedor Individual', 'O Microempreendedor Individual (MEI) possui obrigações tributárias simplificadas. Este guia abrange DAS, DCTFWeb, declaração anual e demais obrigações.', '["Tributário"]', 'Equipe Contaux', 'Interno', 'published', 'public'),
('Lei 13.709/2018 — LGPD', 'legislation', 'Lei Geral de Proteção de Dados Pessoais', '', '["LGPD"]', 'Presidência da República', 'Lei 13.709/2018', 'published', 'public'),
('Como emitir NFS-e?', 'faq', 'Passo a passo para emissão de Nota Fiscal de Serviço Eletrônica', '1. Acesse o portal da prefeitura.\n2. Selecione "Emitir NFS-e".\n3. Preencha os dados do tomador e serviço.\n4. Gere a nota e envie por email ao cliente.', '["Fiscal"]', 'Equipe Contaux', 'Interno', 'published', 'public')
ON CONFLICT DO NOTHING;

COMMIT;
