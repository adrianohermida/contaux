-- Adiciona coluna notes em invoices (observações livres)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
