/**
 * Cloudflare Email Workers — email-router (recebimento) e email-forwarder (envio)
 *
 * - email-router: Worker com handler `email` que recebe mensagens do Email Routing,
 *   extrai remetente/destinatário/assunto/corpo e envia via POST para a API webhook.
 * - email-forwarder: Worker com handler `fetch` que envia emails via MailChannels.
 */

const API_BASE = 'https://api.cloudflare.com/client/v4';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

const ROUTER_NAME = process.env.CLOUDFLARE_ROUTER_WORKER_NAME || 'contaux-email-router';
const FORWARDER_NAME = process.env.CLOUDFLARE_FORWARDER_WORKER_NAME || 'contaux-email-forwarder';
const WORKER_API_KEY = process.env.CLOUDFLARE_WORKER_API_KEY || 'contaux-mail-2024';

/** Script do email-router — handler `email` (inbound) */
const ROUTER_SCRIPT = `
export default {
  async email(message, env) {
    const from = message.from || '';
    const to = message.to || '';
    const subject = message.headers.get('subject') || '(Sem assunto)';

    // Extrai corpo textual do email bruto
    let body = '';
    try {
      const raw = await new Response(message.raw).text();
      body = raw;
    } catch (e) {
      body = '';
    }

    const payload = {
      from,
      to,
      subject,
      body: body.slice(0, 50000),
      receivedAt: new Date().toISOString(),
    };

    try {
      await fetch(env.API_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Key': env.WEBHOOK_KEY,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Loga erro mas não rejeita — Cloudflare retenta automaticamente
      console.error('Falha ao enviar para webhook:', err.message);
    }

    // Opcional: encaminha para um destino de fallback
    if (env.FORWARD_TO) {
      message.forward(env.FORWARD_TO);
    }
  }
};
`;

/** Script do email-forwarder — handler `fetch` (outbound via MailChannels) */
const FORWARDER_SCRIPT = `
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...cors } });
    }
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== env.API_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...cors } });
    }
    try {
      const { to, from, subject, text, html, replyTo } = await request.json();
      if (!to || !from || !subject) {
        return new Response(JSON.stringify({ error: 'to, from e subject sao obrigatorios' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors } });
      }
      const content = [{ type: 'text/plain', value: text || '' }];
      if (html) content.push({ type: 'text/html', value: html });
      const payload = { personalizations: [{ to: [{ email: to }] }], from: { email: from }, subject, content };
      if (replyTo) payload.reply_to = { email: replyTo };
      const mcRes = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!mcRes.ok) {
        const err = await mcRes.text();
        return new Response(JSON.stringify({ error: 'MailChannels error', details: err }), { status: mcRes.status, headers: { 'Content-Type': 'application/json', ...cors } });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', ...cors } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors } });
    }
  }
};
`;

/** Deploya um Worker no Cloudflare */
async function deployWorkerScript(name, script, bindings = []) {
  const metadata = JSON.stringify({
    main_module: 'worker.js',
    bindings,
  });

  const formData = new FormData();
  formData.append('metadata', new Blob([metadata], { type: 'application/json' }));
  formData.append('worker.js', new Blob([script], { type: 'application/javascript+module' }), 'worker.js');

  const res = await fetch(`${API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${name}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: formData,
  });
  return res.json();
}

/** Deploya o email-router (recebimento) */
async function deployRouter() {
  const webhookUrl = process.env.API_PUBLIC_URL
    ? `${process.env.API_PUBLIC_URL}/api/inbox/webhook`
    : 'https://api.contaux.com.br/api/inbox/webhook';

  return deployWorkerScript(ROUTER_NAME, ROUTER_SCRIPT, [
    { type: 'plain_text', name: 'API_WEBHOOK_URL', text: webhookUrl },
    { type: 'plain_text', name: 'WEBHOOK_KEY', text: WORKER_API_KEY },
    { type: 'plain_text', name: 'FORWARD_TO', text: process.env.CONTACT_EMAIL || 'contato@contaux.com.br' },
  ]);
}

/** Deploya o email-forwarder (envio) */
async function deployForwarder() {
  return deployWorkerScript(FORWARDER_NAME, FORWARDER_SCRIPT, [
    { type: 'plain_text', name: 'API_KEY', text: WORKER_API_KEY },
  ]);
}

/** Habilita subdomain workers.dev */
async function enableSubdomain(name) {
  const res = await fetch(`${API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${name}/subdomain`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: true }),
  });
  return res.json();
}

/** Verifica status de um Worker */
async function getWorkerStatus(name) {
  const res = await fetch(`${API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${name}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return { exists: res.ok, status: res.status };
}

/** Deleta um Worker */
async function deleteWorker(name) {
  const res = await fetch(`${API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${name}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return res.json();
}

module.exports = {
  deployRouter,
  deployForwarder,
  enableSubdomain,
  getWorkerStatus,
  deleteWorker,
  sendEmail: require('./cloudflareWorker').sendEmail,
  ROUTER_NAME,
  FORWARDER_NAME,
  WORKER_API_KEY,
};
