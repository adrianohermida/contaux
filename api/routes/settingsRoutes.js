/**
 * Rotas de configurações (singleton) — branding persistente
 * GET  /api/settings     → retorna a configuração atual
 * PUT  /api/settings     → upsert (cria ou atualiza a linha singleton)
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const DEFAULTS = {
  name: 'Contaux Contadoria',
  primary_color: '#3763EB',
  timezone: 'America/Manaus',
  locale: 'pt-BR',
};

// GET — retorna o singleton (ou defaults se a tabela não existir ainda)
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings WHERE id = 1');
    if (result.rows.length === 0) {
      return res.json({ ...DEFAULTS, id: '1' });
    }
    const row = result.rows[0];
    row.id = String(row.id);
    res.json(row);
  } catch (err) {
    console.error('[settings] Erro ao buscar:', err.message);
    // Fallback: retorna defaults se a tabela ainda não existe
    res.json({ ...DEFAULTS, id: '1' });
  }
});

// PUT — upsert do singleton (admin+)
router.put('/', requireAuth, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    const { name, primary_color, timezone, locale } = req.body;
    const result = await query(
      `INSERT INTO settings (id, name, primary_color, timezone, locale, updated)
       VALUES (1, $1, $2, $3, $4, now())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         primary_color = EXCLUDED.primary_color,
         timezone = EXCLUDED.timezone,
         locale = EXCLUDED.locale,
         updated = now()
       RETURNING *`,
      [
        name ?? DEFAULTS.name,
        primary_color ?? DEFAULTS.primary_color,
        timezone ?? DEFAULTS.timezone,
        locale ?? DEFAULTS.locale,
      ],
    );
    const row = result.rows[0];
    row.id = String(row.id);
    res.json(row);
  } catch (err) {
    console.error('[settings] Erro ao salvar:', err.message);
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

module.exports = router;
