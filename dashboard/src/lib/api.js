/**
 * Cliente de API — wrapper de fetch para o backend Contaux
 */

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${res.status}`);
  }

  return res.json();
}

/** Operações CRUD para um recurso */
export function createApiClient(resource) {
  return {
    list: (q) => request(`/${resource}${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    get: (id) => request(`/${resource}/${id}`),
    create: (data) => request(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => request(`/${resource}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    remove: (id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
  };
}
