import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Rate Limiting Storage (In-memory for now, Redis ready)
const rateLimitStore = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.lastReset > 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

function getRateLimitKey(req, userId) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  return `${userId || ip}`;
}

function checkRateLimit(key, limits) {
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record || now - record.lastReset > 60000) {
    record = { count: 0, lastReset: now };
    rateLimitStore.set(key, record);
  }

  record.count++;

  if (record.count > limits.perMinute) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((60000 - (now - record.lastReset)) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: limits.perMinute - record.count,
    resetIn: Math.ceil((60000 - (now - record.lastReset)) / 1000),
  };
}

function validateRequest(req, body) {
  const errors = [];

  // Check required headers
  if (!req.headers.get('content-type')?.includes('application/json')) {
    errors.push('Invalid Content-Type');
  }

  // Sanitize body size
  if (body && JSON.stringify(body).length > 1000000) { // 1MB limit
    errors.push('Request body too large');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function sanitizeResponse(data) {
  // Remove sensitive fields
  const sanitized = JSON.parse(JSON.stringify(data));
  
  if (sanitized.password) delete sanitized.password;
  if (sanitized.token) delete sanitized.token;
  if (sanitized.secret) delete sanitized.secret;

  return sanitized;
}

async function logRequest(req, userId, method, endpoint, statusCode, duration) {
  const timestamp = new Date().toISOString();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  console.log(JSON.stringify({
    timestamp,
    userId,
    ip,
    method,
    endpoint,
    statusCode,
    durationMs: duration,
    userAgent: req.headers.get('user-agent'),
  }));
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const method = req.method;
  const url = new URL(req.url);
  const pathname = url.pathname;

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const userId = user?.email || 'anonymous';

    // Rate limiting per user/IP
    const limitKey = getRateLimitKey(req, userId);
    const rateLimitCheck = checkRateLimit(limitKey, { perMinute: 100 });

    if (!rateLimitCheck.allowed) {
      await logRequest(req, userId, method, pathname, 429, Date.now() - startTime);
      
      return Response.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitCheck.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.resetIn.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + rateLimitCheck.resetIn * 1000).toISOString(),
          },
        }
      );
    }

    // Request validation
    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await req.json();
      } catch {
        body = null;
      }
    }

    const validation = validateRequest(req, body);
    if (!validation.valid) {
      await logRequest(req, userId, method, pathname, 400, Date.now() - startTime);
      
      return Response.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 }
      );
    }

    // Security headers
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
      'X-RateLimit-Reset': new Date(Date.now() + rateLimitCheck.resetIn * 1000).toISOString(),
    };

    // Route to actual handler (placeholder)
    const response = Response.json(
      {
        message: 'API Gateway operational',
        timestamp: new Date().toISOString(),
        user: userId,
        endpoint: pathname,
      },
      {
        status: 200,
        headers: securityHeaders,
      }
    );

    await logRequest(req, userId, method, pathname, 200, Date.now() - startTime);
    return response;

  } catch (error) {
    const userId = 'error-handler';
    await logRequest(req, userId, method, pathname, 500, Date.now() - startTime);
    
    return Response.json(
      { error: 'Internal server error', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});