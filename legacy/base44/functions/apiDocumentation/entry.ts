import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * API Documentation - Documentação dos endpoints
 * Fornece especificação OpenAPI e exemplos
 */
const API_DOCUMENTATION = {
  openapi: '3.0.0',
  info: {
    title: 'Base44 Business API',
    description: 'REST API para gerenciar clientes, faturas e pagamentos',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      url: 'https://base44.com/support',
    },
  },
  servers: [
    {
      url: 'https://api.base44.com/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
  },
  paths: {
    '/clients': {
      get: {
        summary: 'List all clients',
        description: 'Retorna uma lista paginada de clientes',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, maximum: 100 },
            description: 'Número de resultados por página',
          },
          {
            name: 'skip',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Número de resultados a pular',
          },
        ],
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: 'Lista de clientes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array' },
                    meta: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        skip: { type: 'integer' },
                        hasMore: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/clients/{id}': {
      get: {
        summary: 'Get client by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: { description: 'Client details' },
          404: { description: 'Client not found' },
        },
      },
    },
    '/invoices': {
      get: {
        summary: 'List all invoices',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, maximum: 100 },
          },
          {
            name: 'skip',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: { description: 'List of invoices' },
        },
      },
    },
    '/invoices/{id}': {
      get: {
        summary: 'Get invoice by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: { description: 'Invoice details' },
          404: { description: 'Invoice not found' },
        },
      },
    },
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const format = new URL(req.url).searchParams.get('format') || 'json';

    if (format === 'openapi') {
      return Response.json(API_DOCUMENTATION);
    }

    // Retornar documentação em formato HTML
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: #333; }
    .endpoint { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #0066cc; }
    .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px; }
    .get { background: #61affe; color: white; }
    .post { background: #49cc90; color: white; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    .auth { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Base44 Business API</h1>
    <p>Documentação completa dos endpoints disponíveis</p>
    
    <div class="auth">
      <h3>🔐 Autenticação</h3>
      <p>Todos os endpoints requerem a header <code>X-API-Key</code></p>
      <p>Formato: <code>X-API-Key: sk_live_xxxxxxxxxxxxx</code></p>
    </div>

    <h2>Endpoints</h2>
    
    <div class="endpoint">
      <span class="method get">GET</span>
      <code>/v1/clients</code>
      <p>Lista todos os clientes com paginação</p>
      <p><strong>Parâmetros:</strong> limit, skip</p>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span>
      <code>/v1/clients/{id}</code>
      <p>Obtém detalhes de um cliente específico</p>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span>
      <code>/v1/invoices</code>
      <p>Lista todas as faturas com paginação</p>
      <p><strong>Parâmetros:</strong> limit, skip</p>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span>
      <code>/v1/invoices/{id}</code>
      <p>Obtém detalhes de uma fatura específica</p>
    </div>

    <h2>Rate Limiting</h2>
    <p>100 requisições por minuto por API Key</p>

    <h2>OpenAPI Spec</h2>
    <p><a href="?format=openapi">Baixar especificação OpenAPI 3.0</a></p>
  </div>
</body>
</html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});