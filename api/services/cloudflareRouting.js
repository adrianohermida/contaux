/**
 * Cloudflare Email Routing — gerencia o recebimento de emails @contaux.com.br
 * API docs: https://developers.cloudflare.com/api/resources/email_routing/
 */

const API_BASE = 'https://api.cloudflare.com/client/v4';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN_ROUTING_MAIL || process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

function authHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/** Status do Email Routing na zona */
async function getStatus() {
  const res = await fetch(`${API_BASE}/zones/${ZONE_ID}/email/routing`, {
    headers: authHeaders(),
  });
  return res.json();
}

/** Habilita o Email Routing na zona */
async function enable() {
  const res = await fetch(`${API_BASE}/zones/${ZONE_ID}/email/routing/enable`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.json();
}

/** Desabilita o Email Routing */
async function disable() {
  const res = await fetch(`${API_BASE}/zones/${ZONE_ID}/email/routing/disable`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.json();
}

/** Lista regras de roteamento */
async function listRules() {
  const res = await fetch(`${API_BASE}/zones/${ZONE_ID}/email/routing/rules`, {
    headers: authHeaders(),
  });
  return res.json();
}

/** Cria uma regra de roteamento */
async function createRule({ name, matchers, actions, enabled = true, priority }) {
  const body = { name, matchers, actions, enabled, priority };
  if (priority !== undefined) body.priority = priority;
  const res = await fetch(`${API_BASE}/zones/${ZONE_ID}/email/routing/rules`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

/** Deleta uma regra de roteamento */
async function deleteRule(ruleId) {
  const res = await fetch(`${API_BASE}/zones/${ZONE_ID}/email/routing/rules/${ruleId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

/** Atualiza uma regra de roteamento */
async function updateRule(ruleId, { name, matchers, actions, enabled, priority }) {
  const body = {};
  if (name !== undefined) body.name = name;
  if (matchers !== undefined) body.matchers = matchers;
  if (actions !== undefined) body.actions = actions;
  if (enabled !== undefined) body.enabled = enabled;
  if (priority !== undefined) body.priority = priority;
  const res = await fetch(`${API_BASE}/zones/${ZONE_ID}/email/routing/rules/${ruleId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

/** Lista endereços de destino cadastrados */
async function listDestinations() {
  const res = await fetch(`${API_BASE}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/email/routing/addresses`, {
    headers: authHeaders(),
  });
  return res.json();
}

/** Adiciona um endereço de destino (envia email de verificação) */
async function addDestination(email) {
  const res = await fetch(`${API_BASE}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/email/routing/addresses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  return res.json();
}

/** Remove um endereço de destino */
async function deleteDestination(destinationId) {
  const res = await fetch(`${API_BASE}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/email/routing/addresses/${destinationId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

/** Busca registros DNS necessários para o Email Routing */
async function getDnsRecords() {
  const res = await fetch(`${API_BASE}/zones/${ZONE_ID}/email/routing/dns`, {
    headers: authHeaders(),
  });
  return res.json();
}

module.exports = {
  getStatus,
  enable,
  disable,
  listRules,
  createRule,
  deleteRule,
  updateRule,
  listDestinations,
  addDestination,
  deleteDestination,
  getDnsRecords,
};
