/**
 * Rotas de gerenciamento de email — Cloudflare Email Routing + Worker
 */
const express = require('express');
const router = express.Router();

const routing = require('../services/cloudflareRouting');
const worker = require('../services/cloudflareWorker');

// ===== Email Routing (Recebimento) =====

router.get('/routing/status', async (req, res) => {
  try {
    const data = await routing.getStatus();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/routing/enable', async (req, res) => {
  try {
    const data = await routing.enable();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/routing/disable', async (req, res) => {
  try {
    const data = await routing.disable();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/routing/rules', async (req, res) => {
  try {
    const data = await routing.listRules();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/routing/rules', async (req, res) => {
  try {
    const data = await routing.createRule(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/routing/rules/:id', async (req, res) => {
  try {
    const data = await routing.deleteRule(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/routing/rules/:id', async (req, res) => {
  try {
    const data = await routing.updateRule(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/routing/destinations', async (req, res) => {
  try {
    const data = await routing.listDestinations();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/routing/destinations', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });
    const data = await routing.addDestination(email);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/routing/destinations/:id', async (req, res) => {
  try {
    const data = await routing.deleteDestination(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/routing/dns', async (req, res) => {
  try {
    const data = await routing.getDnsRecords();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Email Worker (Envio) =====

router.post('/worker/deploy', async (req, res) => {
  try {
    const deployResult = await worker.deployWorker();
    if (!deployResult.success) {
      return res.status(500).json({ error: 'Falha ao deployar Worker', details: deployResult });
    }
    const subdomainResult = await worker.enableSubdomain();
    res.json({
      success: true,
      worker: worker.WORKER_NAME,
      deploy: deployResult,
      subdomain: subdomainResult,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/worker/status', async (req, res) => {
  try {
    const data = await worker.getWorkerStatus();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/worker', async (req, res) => {
  try {
    const data = await worker.deleteWorker();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
