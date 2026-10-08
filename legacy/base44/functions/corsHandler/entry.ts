import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * CORS Handler
 * Gerencia headers CORS para requisições seguras
 */

const ALLOWED_ORIGINS = [
  'https://localhost:3000',
  'https://localhost:5173',
  'https://app.example.com',
  'https://admin.example.com'
];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-API-Key',
  'Accept'
];

function getCORSHeaders(origin) {
  // Verifica se origin é permitido
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || 
                    ALLOWED_ORIGINS.some(allowed => allowed === '*');
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
}

function handlePreflight(req) {
  const origin = req.headers.get('origin') || '';
  const corsHeaders = getCORSHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export function withCORS(handler) {
  return async (req) => {
    // Preflight request
    if (req.method === 'OPTIONS') {
      return handlePreflight(req);
    }
    
    // Executa handler original
    const response = await handler(req);
    
    // Adiciona headers CORS à resposta
    const origin = req.headers.get('origin') || '';
    const corsHeaders = getCORSHeaders(origin);
    
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });
    
    return newResponse;
  };
}

Deno.serve(async (req) => {
  try {
    const origin = req.headers.get('origin') || 'unknown';
    
    // Preflight
    if (req.method === 'OPTIONS') {
      return handlePreflight(req);
    }
    
    return Response.json({
      success: true,
      message: 'CORS handler operational',
      origin,
      allowedOrigins: ALLOWED_ORIGINS
    }, {
      headers: getCORSHeaders(origin)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});