/**
 * Valida e inicializa chave de encriptação
 * Rodado no startup
 */

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');

Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET') {
      return Response.json({ error: 'Only GET allowed' }, { status: 405 });
    }

    if (!ENCRYPTION_KEY) {
      return Response.json({
        status: 'error',
        message: 'ENCRYPTION_KEY not configured',
        action: 'Set ENCRYPTION_KEY in dashboard environment variables'
      }, { status: 503 });
    }

    if (ENCRYPTION_KEY.length < 32) {
      return Response.json({
        status: 'error',
        message: 'ENCRYPTION_KEY too short (min 32 chars)',
        action: 'Use a stronger key'
      }, { status: 503 });
    }

    return Response.json({
      status: 'ok',
      message: 'Encryption service ready',
      key_length: ENCRYPTION_KEY.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});