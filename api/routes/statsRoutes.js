/**
 * Rotas de estatísticas — métricas agregadas para dashboard e relatórios.
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, getAccessibleTenantIds } = require('../middleware/auth');

// GET /api/stats/dashboard — métricas para o painel de relatórios
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);
    const clause = `tenant_id = ANY($1::int[])`;

    const [clientsRes, paymentsRes, ticketsRes, nfeRes] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM clients WHERE ${clause} AND status = 'active'`, [tenantIds]),
      query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM payments
         WHERE ${clause} AND status = 'paid'
         AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
        [tenantIds],
      ),
      query(
        `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE priority = 'high') as urgent
         FROM tickets WHERE ${clause} AND status = 'open'`,
        [tenantIds],
      ),
      query(
        `SELECT COUNT(*) as total FROM tax_invoices
         WHERE ${clause}
         AND EXTRACT(MONTH FROM issue_date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
        [tenantIds],
      ),
    ]);

    res.json({
      active_clients: parseInt(clientsRes.rows[0].total),
      monthly_revenue: parseFloat(paymentsRes.rows[0].total),
      open_tickets: parseInt(ticketsRes.rows[0].total),
      urgent_tickets: parseInt(ticketsRes.rows[0].urgent),
      monthly_nfe: parseInt(nfeRes.rows[0].total),
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas do dashboard:', err.message);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/stats/security — métricas do centro de segurança
router.get('/security', requireAuth, async (req, res) => {
  try {
    const tenantIds = await getAccessibleTenantIds(req.user);

    const [usersRes, mfaRes, loginsRes, auditRes] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM users WHERE tenant_id = ANY($1::int[]) AND active = true`, [tenantIds]),
      query(`SELECT COUNT(*) as total FROM users WHERE tenant_id = ANY($1::int[]) AND active = true AND mfa_enabled = true`, [tenantIds]),
      query(
        `SELECT id, name, email, role, last_login FROM users
         WHERE tenant_id = ANY($1::int[]) AND active = true AND last_login IS NOT NULL
         ORDER BY last_login DESC LIMIT 10`,
        [tenantIds],
      ),
      query(
        `SELECT id, "user", action, entity_type, ip, timestamp FROM audit_logs
         WHERE tenant_id = ANY($1::int[]) ORDER BY timestamp DESC LIMIT 10`,
        [tenantIds],
      ),
    ]);

    res.json({
      total_users: parseInt(usersRes.rows[0].total),
      mfa_enabled: parseInt(mfaRes.rows[0].total),
      recent_logins: loginsRes.rows.map((r) => ({ ...r, id: String(r.id) })),
      recent_audit: auditRes.rows.map((r) => ({ ...r, id: String(r.id) })),
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas de segurança:', err.message);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de segurança' });
  }
});

module.exports = router;
