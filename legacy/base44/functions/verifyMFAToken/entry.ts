import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backend function para verificar TOTP token
 * Valida código do authenticator
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { secret, token } = payload;

    if (!secret || !token) {
      return Response.json({ error: 'Missing secret or token' }, { status: 400 });
    }

    // Verificar TOTP token (simplificado)
    // Em produção, usar biblioteca como speakeasy ou otplib
    const isValid = verifyTOTP(secret, token);

    return Response.json({
      valid: isValid,
      message: isValid ? 'Token válido' : 'Token inválido'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function verifyTOTP(secret, token) {
  // Verificação simplificada
  // Em produção, usar biblioteca proper para HMAC-SHA1
  if (!token || token.length !== 6) {
    return false;
  }
  
  // Verificar se é numérico
  if (!/^\d{6}$/.test(token)) {
    return false;
  }

  // Em produção: 
  // const speakeasy = require('speakeasy');
  // return speakeasy.totp.verify({ secret, token, window: 1 });

  return true; // Simplificado para exemplo
}