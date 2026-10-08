/**
 * Rotas de gerenciamento de email — Cloudflare Email Routing + Worker
 */
const express = require('express');
const router = express.Router();

const routing = require('../services/cloudflareRouting');
const worker = require('../services/cloudflareWorker');
const emailWorkers = require('../services/emailWorkers');

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

// ===== Email Workers (Router + Forwarder) =====

// Deploya ambos os workers (router = recebimento, forwarder = envio)
router.post('/workers/deploy', async (req, res) => {
  try {
    const routerResult = await emailWorkers.deployRouter();
    const forwarderResult = await emailWorkers.deployForwarder();
    const routerSubdomain = await emailWorkers.enableSubdomain(emailWorkers.ROUTER_NAME);
    const forwarderSubdomain = await emailWorkers.enableSubdomain(emailWorkers.FORWARDER_NAME);

    res.json({
      success: true,
      router: { name: emailWorkers.ROUTER_NAME, deploy: routerResult, subdomain: routerSubdomain },
      forwarder: { name: emailWorkers.FORWARDER_NAME, deploy: forwarderResult, subdomain: forwarderSubdomain },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Status de ambos os workers
router.get('/workers/status', async (req, res) => {
  try {
    const router = await emailWorkers.getWorkerStatus(emailWorkers.ROUTER_NAME);
    const forwarder = await emailWorkers.getWorkerStatus(emailWorkers.FORWARDER_NAME);
    res.json({ router, forwarder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Worker legado (envio) — mantido para compatibilidade =====

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
