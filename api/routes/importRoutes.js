/**
 * Rotas de importação em massa — aceita arrays JSON e insere em lote
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// Todas as rotas de importação exigem autenticação + staff
router.use(requireAuth, requireRole('superadmin', 'admin', 'accountant'));

/**
 * Insere registros em massa numa tabela.
 * @param {string} table - Nome da tabela
 * @param {string[]} columns - Colunas a inserir
 * @param {Array<Array>} rows - Linhas de valores (mesma ordem das colunas)
 * @returns {number} Quantidade inserida
 */
async function bulkInsert(table, columns, rows) {
  const reserved = new Set(['user', 'from', 'to', 'order', 'group', 'select', 'where', 'limit']);
  const col = (n) => (reserved.has(n) ? `"${n}"` : n);

  let inserted = 0;
  for (const row of rows) {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const cols = columns.map(col).join(', ');
    await query(
      `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`,
      row,
    );
    inserted++;
  }
  return inserted;
}

// POST /api/import/clients — importa lista de clientes
router.post('/clients', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Envie um array de clientes.' });
    }

    const columns = ['name', 'type', 'document', 'email', 'phone', 'status', 'tags', 'address', 'fiscal', 'created', 'updated', 'tenant_id'];
    const rows = items.map((c) => [
      c.name || '',
      c.type || 'PJ',
      c.document || '',
      c.email || null,
      c.phone || null,
      c.status || 'active',
      JSON.stringify(c.tags || []),
      JSON.stringify(c.address || {}),
      JSON.stringify(c.fiscal || {}),
      c.created || new Date().toISOString().slice(0, 10),
      c.updated || new Date().toISOString().slice(0, 10),
      req.user.tenant_id,
    ]);

    const count = await bulkInsert('clients', columns, rows);
    res.json({ success: true, imported: count });
  } catch (err) {
    console.error('[import] Erro ao importar clientes:', err.message);
    res.status(500).json({ error: `Erro ao importar: ${err.message}` });
  }
});

// POST /api/import/invoices — importa lista de faturas
router.post('/invoices', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Envie um array de faturas.' });
    }

    const columns = ['number', 'client_name', 'issue_date', 'due_date', 'items', 'discount', 'status', 'tenant_id'];
    const rows = items.map((c) => [
      c.number || '',
      c.client_name || '',
      c.issue_date || null,
      c.due_date || null,
      JSON.stringify(c.items || []),
      c.discount || 0,
      c.status || 'draft',
      req.user.tenant_id,
    ]);

    const count = await bulkInsert('invoices', columns, rows);
    res.json({ success: true, imported: count });
  } catch (err) {
    console.error('[import] Erro ao importar faturas:', err.message);
    res.status(500).json({ error: `Erro ao importar: ${err.message}` });
  }
});

// POST /api/import/payments — importa lista de pagamentos
router.post('/payments', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Envie um array de pagamentos.' });
    }

    const columns = ['invoice_number', 'client_name', 'amount', 'payment_date', 'method', 'status', 'reference', 'tenant_id'];
    const rows = items.map((c) => [
      c.invoice_number || '',
      c.client_name || '',
      c.amount || 0,
      c.payment_date || null,
      c.method || 'pix',
      c.status || 'pending',
      c.reference || null,
      req.user.tenant_id,
    ]);

    const count = await bulkInsert('payments', columns, rows);
    res.json({ success: true, imported: count });
  } catch (err) {
    console.error('[import] Erro ao importar pagamentos:', err.message);
    res.status(500).json({ error: `Erro ao importar: ${err.message}` });
  }
});

// POST /api/import/accounts — importa plano de contas
router.post('/accounts', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Envie um array de contas.' });
    }

    const columns = ['code', 'name', 'type', 'level', 'active', 'tenant_id'];
    const rows = items.map((c) => [
      c.code || '',
      c.name || '',
      c.type || 'asset',
      c.level || 1,
      c.active !== false,
      req.user.tenant_id,
    ]);

    const count = await bulkInsert('accounts', columns, rows);
    res.json({ success: true, imported: count });
  } catch (err) {
    console.error('[import] Erro ao importar contas:', err.message);
    res.status(500).json({ error: `Erro ao importar: ${err.message}` });
  }
});

// POST /api/import/journal-entries — importa lançamentos contábeis
router.post('/journal-entries', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Envie um array de lançamentos.' });
    }

    const columns = ['date', 'description', 'reference', 'status', 'lines', 'tenant_id'];
    const rows = items.map((c) => [
      c.date || new Date().toISOString().slice(0, 10),
      c.description || '',
      c.reference || null,
      c.status || 'draft',
      JSON.stringify(c.lines || []),
      req.user.tenant_id,
    ]);

    const count = await bulkInsert('journal_entries', columns, rows);
    res.json({ success: true, imported: count });
  } catch (err) {
    console.error('[import] Erro ao importar lançamentos:', err.message);
    res.status(500).json({ error: `Erro ao importar: ${err.message}` });
  }
});

// POST /api/import/obligations — importa obrigações fiscais
router.post('/obligations', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Envie um array de obrigações.' });
    }

    const columns = ['title', 'description', 'due_date', 'type', 'frequency', 'status', 'tenant_id'];
    const rows = items.map((c) => [
      c.title || '',
      c.description || null,
      c.due_date || null,
      c.type || 'federal',
      c.frequency || 'monthly',
      c.status || 'pending',
      req.user.tenant_id,
    ]);

    const count = await bulkInsert('obligations', columns, rows);
    res.json({ success: true, imported: count });
  } catch (err) {
    console.error('[import] Erro ao importar obrigações:', err.message);
    res.status(500).json({ error: `Erro ao importar: ${err.message}` });
  }
});

module.exports = router;
