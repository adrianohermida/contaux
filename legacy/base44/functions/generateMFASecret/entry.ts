import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backend function para gerar MFA secret
 * TOTP-compatible secret + QR code + backup codes
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { email } = payload;

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Gerar secret TOTP (base32)
    const secret = generateSecret();
    
    // Gerar QR code URL (simulado)
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${email}?secret=${secret}`;
    
    // Gerar backup codes
    const backupCodes = generateBackupCodes(10);

    return Response.json({
      secret,
      qrCode,
      backupCodes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function generateBackupCodes(count) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += Math.floor(Math.random() * 10);
    }
    codes.push(code.replace(/(\d{4})(\d{4})/, '$1-$2'));
  }
  return codes;
}