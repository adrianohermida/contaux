import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Rate Limiter usando Redis-like cache
 * Limita requisições por IP/API Key
 * Limite: 100 requisições por 15 minutos
 */

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS = 100;
const requestCounts = new Map();

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.firstRequestTime > RATE_LIMIT_WINDOW) {
      requestCounts.delete(key);
    }
  }
}

function getRateLimitKey(req, apiKey) {
  // Prioriza API key, senão usa IP
  return apiKey || req.headers.get('x-forwarded-for') || 'unknown';
}

function isRateLimited(key) {
  cleanExpiredEntries();
  
  const now = Date.now();
  const data = requestCounts.get(key) || { count: 0, firstRequestTime: now };
  
  if (now - data.firstRequestTime > RATE_LIMIT_WINDOW) {
    requestCounts.set(key, { count: 1, firstRequestTime: now });
    return false;
  }
  
  data.count++;
  requestCounts.set(key, data);
  
  return data.count > MAX_REQUESTS;
}

export function checkRateLimit(req, apiKey) {
  const key = getRateLimitKey(req, apiKey);
  
  if (isRateLimited(key)) {
    return {
      limited: true,
      response: new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Maximum ${MAX_REQUESTS} requests per 15 minutes`,
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        }),
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000),
            'Content-Type': 'application/json'
          }
        }
      )
    };
  }
  
  return { limited: false };
}

Deno.serve(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get('api_key');
    
    const rateCheck = checkRateLimit(req, apiKey);
    if (rateCheck.limited) {
      return rateCheck.response;
    }
    
    return Response.json({ 
      success: true, 
      message: 'Rate limiter operational',
      limit: MAX_REQUESTS,
      window: `${RATE_LIMIT_WINDOW / 1000 / 60} minutes`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});