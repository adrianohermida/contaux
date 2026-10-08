-- Migração 013 — Permite document nulo na tabela clients
-- Um cliente pode ser criado sem documento (ex: cadastro rápido, lead convertido)
BEGIN;
ALTER TABLE clients ALTER COLUMN document DROP NOT NULL;
COMMIT;
