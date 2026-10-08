/**
 * Rotas de orquestração de tarefas (AC-GLOBAL-04).
 * Transições de status com validação e log de execução durável.
 */
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const taskExecutor = require('../services/taskExecutor');

router.use(requireAuth);

// Transiciona o status de uma tarefa
router.patch('/:id/status', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) return res.status(400).json({ error: 'ID inválido' });

    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ error: 'status é obrigatório' });

    const updated = await taskExecutor.transitionStatus(taskId, status, req.user, notes);
    res.json(updated);
  } catch (err) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ error: err.message });
    if (err.code === 'INVALID_TRANSITION') return res.status(409).json({ error: err.message });
    console.error('[tasks] Erro ao transicionar status:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Busca o log de execução de uma tarefa
router.get('/:id/execution-log', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) return res.status(400).json({ error: 'ID inválido' });

    const log = await taskExecutor.getExecutionLog(taskId, req.user);
    res.json(log);
  } catch (err) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ error: err.message });
    console.error('[tasks] Erro ao buscar log:', err.message);
    res.status(500).json({ error: 'Erro ao buscar log de execução' });
  }
});

module.exports = router;
