/**
 * Cliente de API — wrapper de fetch para o backend Contaux
 * CQ-03: usa cookie httpOnly para refresh, access token em memória.
 */

const BASE = '/api';

// Access token em memória (não persiste em localStorage)
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
  scheduleProactiveRefresh();
}
export function getAccessToken() { return accessToken; }

// Controle de refresh para evitar múltiplas chamadas simultâneas
let refreshing = null;

async function doRefresh() {
  if (refreshing) return refreshing;
  refreshing = fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((r) => (r.ok ? r.json() : null))
    .finally(() => { refreshing = null; });
  return refreshing;
}

// Refresh proativo: renova o token 1 min antes de expirar (15 min de vida útil)
const REFRESH_BEFORE_MS = 14 * 60 * 1000; // 14 minutos
let refreshTimer = null;

function scheduleProactiveRefresh() {
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null; }
  if (!accessToken) return;

  refreshTimer = setTimeout(async () => {
    const refreshed = await doRefresh();
    if (refreshed?.token) {
      setAccessToken(refreshed.token);
    } else {
      // Refresh proativo falhou — limpa sessão
      accessToken = null;
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }, REFRESH_BEFORE_MS);

  // Não impede o Node de sair (dev apenas)
  if (typeof refreshTimer === 'object' && refreshTimer.unref) refreshTimer.unref();
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
}

export async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...getAuthHeaders(), ...options.headers },
  });

  // 401: tenta refresh e refaz a requisição original
  if (res.status === 401 && !options._retried) {
    const refreshed = await doRefresh();
    if (refreshed?.token) {
      setAccessToken(refreshed.token);
      return request(path, { ...options, _retried: true });
    }
    // Refresh falhou — limpa sessão
    accessToken = null;
    if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null; }
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Sessão expirada');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${res.status}`);
  }

  return res.json();
}

/** DELETE com proteção de PIN — caller fornece o pin_token obtido via PinModal */
export function pinDelete(resource, id, pinToken) {
  return request(`/${resource}/${id}`, {
    method: 'DELETE',
    headers: { 'X-PIN-Token': pinToken },
  });
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
