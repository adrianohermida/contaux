/**
 * Serviço de encriptação AES-256-GCM
 * Usado para dados sensíveis (MFA secrets, credenciais, etc)
 */

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY not set. Please set it in environment variables.');
}

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return crypto.subtle.importKey('raw', hashBuffer, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encrypt(plaintext, password = ENCRYPTION_KEY) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveKey(password, new TextDecoder().decode(salt));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  const result = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(ciphertext), salt.length + iv.length);
  
  return Buffer.from(result).toString('base64');
}

async function decrypt(encryptedData, password = ENCRYPTION_KEY) {
  const data = Buffer.from(encryptedData, 'base64');
  
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);
  
  const key = await deriveKey(password, new TextDecoder().decode(salt));
  
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(plaintext);
}

export { encrypt, decrypt };