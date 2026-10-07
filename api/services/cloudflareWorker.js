/**
 * Cloudflare Worker — envio de emails via MailChannels
 * Deploya um Worker no Cloudflare que recebe requisições HTTP e envia emails
 * através do MailChannels (gratuito para usuários do Cloudflare).
 */

const API_BASE = 'https://api.cloudflare.com/client/v4';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const WORKER_NAME = process.env.CLOUDFLARE_WORKER_NAME || 'contaux-email-sender';
const WORKER_API_KEY = process.env.CLOUDFLARE_WORKER_API_KEY || 'contaux-mail-2024';

/** Script do Worker (ES module format) */
const WORKER_SCRIPT = `
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
        return new Response(JSON.stringify({ error: 'to, from, subject sao obrigatorios' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors } });
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

/** Deploya (ou atualiza) o Worker no Cloudflare */
async function deployWorker() {
  const metadata = JSON.stringify({
    main_module: 'worker.js',
    bindings: [
      { type: 'plain_text', name: 'API_KEY', text: WORKER_API_KEY },
    ],
  });

  const formData = new FormData();
  formData.append('metadata', new Blob([metadata], { type: 'application/json' }));
  formData.append('worker.js', new Blob([WORKER_SCRIPT], { type: 'application/javascript+module' }), 'worker.js');

  const res = await fetch(`${API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${WORKER_NAME}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: formData,
  });
  return res.json();
}

/** Habilita o subdomain workers.dev para o Worker (necessário para receber requisições) */
async function enableSubdomain() {
  const res = await fetch(`${API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${WORKER_NAME}/subdomain`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: true }),
  });
  return res.json();
}

/** Verifica se o Worker existe */
async function getWorkerStatus() {
  const res = await fetch(`${API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${WORKER_NAME}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return { exists: res.ok, status: res.status };
}

/** Deleta o Worker */
async function deleteWorker() {
  const res = await fetch(`${API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${WORKER_NAME}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return res.json();
}

/**
 * Envia um email através do Worker deployado.
 * @param {Object} params - { to, from, subject, text, html, replyTo }
 * @returns {Object} resultado do envio
 */
async function sendEmail({ to, from, subject, text, html, replyTo }) {
  const subdomain = process.env.CLOUDFLARE_WORKERS_SUBDOMAIN || WORKER_NAME;
  const workerUrl = `https://${subdomain}.${process.env.CLOUDFLARE_WORKERS_DOMAIN || 'contaux.workers.dev'}`;

  const res = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': WORKER_API_KEY,
    },
    body: JSON.stringify({ to, from, subject, text, html, replyTo }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.details || 'Erro ao enviar email via Worker');
  }
  return data;
}

module.exports = {
  deployWorker,
  enableSubdomain,
  getWorkerStatus,
  deleteWorker,
  sendEmail,
  WORKER_NAME,
};
