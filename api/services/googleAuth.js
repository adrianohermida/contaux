/**
 * Serviço de autenticação OAuth 2.0 do Google.
 * Gerencia fluxo de autorização, armazenamento e refresh de tokens.
 * Cobertura: Calendar, Drive, Tasks, Sheets, Docs, Forms, Ads.
 */
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/adwords',
  'openid',
  'email',
  'profile',
];

function getOAuthClient(redirectUri) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri || process.env.GOOGLE_REDIRECT_URI,
  );
}

/** Gera URL de autorização com state JWT contendo userId e tenantId */
function getAuthUrl(redirectUri, user) {
  const oauth2Client = getOAuthClient(redirectUri);
  const state = jwt.sign(
    { userId: user.id, tenantId: user.tenant_id },
    process.env.JWT_SECRET,
    { expiresIn: '10m' },
  );
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state,
  });
}

/** Troca código de autorização por tokens */
async function exchangeCode(code, redirectUri) {
  const oauth2Client = getOAuthClient(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/** Busca perfil do usuário Google via userinfo */
async function getUserInfo(tokens) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(tokens);
  const { data } = await google.oauth2('v2').userinfo.get({ auth: oauth2Client });
  return data;
}

/** Salva ou atualiza tokens no banco */
async function saveTokens(userId, tenantId, tokens, profile) {
  const expiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
  const existing = await query(
    'SELECT id FROM google_connections WHERE tenant_id = $1 AND user_id = $2',
    [tenantId, userId],
  );
  if (existing.rows.length > 0) {
    await query(
      `UPDATE google_connections SET access_token = $3, refresh_token = COALESCE($4, refresh_token),
       token_expiry = $5, scope = $6, google_email = $7, google_name = $8, google_picture = $9,
       updated_at = now() WHERE tenant_id = $1 AND user_id = $2`,
      [tenantId, userId, tokens.access_token, tokens.refresh_token, expiry,
        tokens.scope, profile?.email, profile?.name, profile?.picture],
    );
  } else {
    await query(
      `INSERT INTO google_connections (tenant_id, user_id, access_token, refresh_token, token_expiry, scope, google_email, google_name, google_picture)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [tenantId, userId, tokens.access_token, tokens.refresh_token, expiry,
        tokens.scope, profile?.email, profile?.name, profile?.picture],
    );
  }
}

/** Busca conexão ativa no banco */
async function getConnection(userId, tenantId) {
  const result = await query(
    'SELECT * FROM google_connections WHERE tenant_id = $1 AND user_id = $2',
    [tenantId, userId],
  );
  return result.rows[0] || null;
}

/** Cria cliente OAuth autenticado com auto-refresh */
async function getAuthenticatedClient(userId, tenantId) {
  const conn = await getConnection(userId, tenantId);
  if (!conn) return null;
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: conn.access_token,
    refresh_token: conn.refresh_token,
    expiry_date: conn.token_expiry ? new Date(conn.token_expiry).getTime() : null,
  });
  // Auto-refresh: salva novos tokens quando expirarem
  oauth2Client.on('tokens', async (tokens) => {
    await saveTokens(userId, tenantId, tokens, null);
  });
  return { client: oauth2Client, connection: conn };
}

/** Revoga tokens e remove conexão */
async function disconnect(userId, tenantId) {
  const conn = await getConnection(userId, tenantId);
  if (conn?.access_token) {
    try {
      const oauth2Client = getOAuthClient();
      oauth2Client.setCredentials({ access_token: conn.access_token });
      await oauth2Client.revokeToken(conn.access_token);
    } catch (e) { /* ignora erro de revogação */ }
  }
  await query('DELETE FROM google_connections WHERE tenant_id = $1 AND user_id = $2', [tenantId, userId]);
}

module.exports = {
  SCOPES, getOAuthClient, getAuthUrl, exchangeCode, getUserInfo,
  saveTokens, getConnection, getAuthenticatedClient, disconnect,
};
