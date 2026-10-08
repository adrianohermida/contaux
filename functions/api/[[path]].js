/**
 * Pages Function — proxy para o backend da API Contaux.
 *
 * Roteia todas as requisições /api/* para o servidor Express (definido em API_URL).
 * O backend roda em uma VPS ou outro host; o Pages Function atua como proxy
 * na edge da Cloudflare, mantendo tudo no mesmo domínio (sem CORS).
 *
 * Variável de ambiente:
 *   API_URL — URL base do backend (ex: https://api.contaux.com.br)
 *   Defina via: wrangler pages secret put API_URL --project-name=contaux
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const apiBase = (env.API_URL || 'http://localhost:3001').replace(/\/$/, '');

  // Constrói a URL de destino: /api/settings → ${API_URL}/api/settings
  const targetUrl = `${apiBase}${url.pathname}${url.search}`;

  // Repassa headers, removendo host/origin para evitar conflitos
  const headers = new Headers(request.headers);
  headers.delete('host');

  const proxyInit = {
    method: request.method,
    headers,
  };

  // Anexa body para métodos que o suportam
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    proxyInit.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, proxyInit);

    // Adiciona headers CORS caso o backend não os tenha
    const respHeaders = new Headers(response.headers);
    respHeaders.set('Access-Control-Allow-Origin', '*');
    respHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    respHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: respHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Backend indisponível', detail: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Handle preflight OPTIONS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
