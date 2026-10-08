/**
 * Cliente de API — wrapper de fetch para o backend Contaux
 */

const BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('contaux-token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });

  if (res.status === 401) {
    localStorage.removeItem('contaux-token');
    localStorage.removeItem('contaux-user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

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
