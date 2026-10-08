/**
 * Rotas do Assistente — conversas persistentes (AC-GLOBAL-02).
 * CRUD de conversas e mensagens com isolamento por tenant e usuário.
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// ===== Conversas =====

// Listar conversas do usuário (mais recentes primeiro)
router.get('/conversations', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, context, created_at, updated_at,
              (SELECT count(*) FROM assistant_messages WHERE conversation_id = c.id) AS message_count
       FROM assistant_conversations c
       WHERE user_id = $1
       ORDER BY updated_at DESC
       LIMIT 50`,
      [req.user.id],
    );
    res.json(result.rows.map((r) => ({
      ...r,
      id: String(r.id),
      context: typeof r.context === 'string' ? JSON.parse(r.context) : r.context,
    })));
  } catch (err) {
    console.error('[assistant] Erro ao listar conversas:', err.message);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

// Criar nova conversa
router.post('/conversations', async (req, res) => {
  try {
    const { title, context } = req.body;
    const result = await query(
      `INSERT INTO assistant_conversations (user_id, tenant_id, title, context)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, context, created_at, updated_at`,
      [req.user.id, req.user.tenant_id, title || 'Nova conversa', context ? JSON.stringify(context) : null],
    );
    const row = result.rows[0];
    res.status(201).json({
      ...row,
      id: String(row.id),
      context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
    });
  } catch (err) {
    console.error('[assistant] Erro ao criar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao criar conversa' });
  }
});

// Buscar conversa com mensagens
router.get('/conversations/:id', async (req, res) => {
  try {
    const convResult = await query(
      `SELECT id, title, context, created_at, updated_at
       FROM assistant_conversations
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    const conv = convResult.rows[0];
    const msgResult = await query(
      `SELECT id, role, text, sources, created_at
       FROM assistant_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conv.id],
    );
    res.json({
      ...conv,
      id: String(conv.id),
      context: typeof conv.context === 'string' ? JSON.parse(conv.context) : conv.context,
      messages: msgResult.rows.map((m) => ({
        ...m,
        id: String(m.id),
        sources: typeof m.sources === 'string' ? JSON.parse(m.sources) : m.sources,
      })),
    });
  } catch (err) {
    console.error('[assistant] Erro ao buscar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

// Atualizar conversa (título / contexto)
router.patch('/conversations/:id', async (req, res) => {
  try {
    const { title, context } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (context !== undefined) { fields.push(`context = $${idx++}`); values.push(JSON.stringify(context)); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });

    fields.push(`updated_at = now()`);
    values.push(req.params.id, req.user.id);

    const result = await query(
      `UPDATE assistant_conversations SET ${fields.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx++}
       RETURNING id, title, context, created_at, updated_at`,
      values,
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });
    const row = result.rows[0];
    res.json({
      ...row,
      id: String(row.id),
      context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
    });
  } catch (err) {
    console.error('[assistant] Erro ao atualizar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar conversa' });
  }
});

// Deletar conversa
router.delete('/conversations/:id', async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM assistant_conversations WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });
    res.json({ success: true });
  } catch (err) {
    console.error('[assistant] Erro ao deletar conversa:', err.message);
    res.status(500).json({ error: 'Erro ao deletar conversa' });
  }
});

// ===== Mensagens =====

// Adicionar mensagem a uma conversa
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { role, text, sources } = req.body;
    if (!role || !text) return res.status(400).json({ error: 'role e text são obrigatórios' });
    if (!['user', 'assistant'].includes(role)) return res.status(400).json({ error: 'role inválido' });

    // Verifica propriedade da conversa
    const convCheck = await query(
      `SELECT id FROM assistant_conversations WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (convCheck.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });

    const result = await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, sources)
       VALUES ($1, $2, $3, $4)
       RETURNING id, role, text, sources, created_at`,
      [req.params.id, role, text, sources ? JSON.stringify(sources) : null],
    );
    const row = result.rows[0];

    // Atualiza updated_at da conversa
    await query(`UPDATE assistant_conversations SET updated_at = now() WHERE id = $1`, [req.params.id]);

    res.status(201).json({
      ...row,
      id: String(row.id),
      sources: typeof row.sources === 'string' ? JSON.parse(row.sources) : row.sources,
    });
  } catch (err) {
    console.error('[assistant] Erro ao salvar mensagem:', err.message);
    res.status(500).json({ error: 'Erro ao salvar mensagem' });
  }
});

module.exports = router;
