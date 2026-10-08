/**
 * Cliente de API para gerenciamento de email — Cloudflare Routing + Workers
 */

const BASE = '/api/email'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
  return data
}

export const emailApi = {
  // Email Routing
  getRoutingStatus: () => request('/routing/status'),
  enableRouting: () => request('/routing/enable', { method: 'POST' }),
  disableRouting: () => request('/routing/disable', { method: 'POST' }),
  listRules: () => request('/routing/rules'),
  createRule: (rule) => request('/routing/rules', { method: 'POST', body: JSON.stringify(rule) }),
  deleteRule: (id) => request(`/routing/rules/${id}`, { method: 'DELETE' }),
  updateRule: (id, rule) => request(`/routing/rules/${id}`, { method: 'PUT', body: JSON.stringify(rule) }),
  listDestinations: () => request('/routing/destinations'),
  addDestination: (email) => request('/routing/destinations', { method: 'POST', body: JSON.stringify({ email }) }),
  deleteDestination: (id) => request(`/routing/destinations/${id}`, { method: 'DELETE' }),
  getDns: () => request('/routing/dns'),

  // Workers
  deployWorkers: () => request('/workers/deploy', { method: 'POST' }),
  getWorkersStatus: () => request('/workers/status'),
}
