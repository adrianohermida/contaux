/**
 * Rotas de integração com Google (Calendar, Drive, Tasks, Sheets, Docs, Forms, Ads).
 * OAuth 2.0 com tokens armazenados por tenant+usuário.
 */
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/auth');
const googleAuth = require('../services/googleAuth');

// ===== AUTH (rotas de conexão) =====

// Inicia fluxo OAuth — redireciona para tela de consentimento do Google
router.get('/auth', requireAuth, (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google OAuth não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.' });
  }
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
    `${req.protocol}://${req.get('host')}/api/google/auth/callback`;
  const url = googleAuth.getAuthUrl(redirectUri, req.user);
  res.redirect(url);
});

// Callback OAuth — o Google redireciona o navegador para cá
router.get('/auth/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.redirect('/google?error=' + encodeURIComponent(error));
  if (!code || !state) return res.redirect('/google?error=missing_params');
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
      `${req.protocol}://${req.get('host')}/api/google/auth/callback`;
    const tokens = await googleAuth.exchangeCode(code, redirectUri);
    const profile = await googleAuth.getUserInfo(tokens);
    await googleAuth.saveTokens(decoded.userId, decoded.tenantId, tokens, profile);
    res.redirect('/google?connected=1');
  } catch (err) {
    res.redirect('/google?error=' + encodeURIComponent(err.message));
  }
});

// Status da conexão
router.get('/status', requireAuth, async (req, res) => {
  const conn = await googleAuth.getConnection(req.user.id, req.user.tenant_id);
  if (!conn) return res.json({ connected: false });
  res.json({
    connected: true,
    profile: { email: conn.google_email, name: conn.google_name, picture: conn.google_picture },
  });
});

// Desconectar — revoga tokens e remove conexão
router.delete('/disconnect', requireAuth, async (req, res) => {
  await googleAuth.disconnect(req.user.id, req.user.tenant_id);
  res.json({ success: true });
});

// ===== Helper: cliente autenticado =====
async function getClient(req) {
  const result = await googleAuth.getAuthenticatedClient(req.user.id, req.user.tenant_id);
  if (!result) throw new Error('Google não conectado');
  return result;
}

// ===== Todas as rotas abaixo exigem auth =====
router.use(requireAuth);

// ===== CALENDAR =====
router.get('/calendar/events', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const calendar = google.calendar({ version: 'v3', auth: client });
    const { data } = await calendar.events.list({
      calendarId: 'primary', maxResults: 20, orderBy: 'startTime',
      singleEvents: true, timeMin: new Date().toISOString(),
    });
    res.json(data.items || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/calendar/events', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const calendar = google.calendar({ version: 'v3', auth: client });
    const { data } = await calendar.events.insert({ calendarId: 'primary', requestBody: req.body });
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== DRIVE =====
router.get('/drive/files', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const drive = google.drive({ version: 'v3', auth: client });
    const { data } = await drive.files.list({
      pageSize: 20, orderBy: 'modifiedTime desc', q: 'trashed = false',
      fields: 'files(id,name,mimeType,modifiedTime,iconLink,webViewLink,thumbnailLink)',
    });
    res.json(data.files || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== TASKS =====
router.get('/tasks/lists', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const tasks = google.tasks({ version: 'v1', auth: client });
    const { data } = await tasks.tasklists.list();
    res.json(data.items || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/tasks/lists/:listId/tasks', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const tasks = google.tasks({ version: 'v1', auth: client });
    const { data } = await tasks.tasks.list({ tasklist: req.params.listId });
    res.json(data.items || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tasks/lists/:listId/tasks', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const tasks = google.tasks({ version: 'v1', auth: client });
    const { data } = await tasks.tasks.insert({ tasklist: req.params.listId, requestBody: req.body });
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== SHEETS =====
router.get('/sheets', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const drive = google.drive({ version: 'v3', auth: client });
    const { data } = await drive.files.list({
      pageSize: 20, orderBy: 'modifiedTime desc',
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed = false",
      fields: 'files(id,name,modifiedTime,webViewLink,iconLink)',
    });
    res.json(data.files || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/sheets/:id/values', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const sheets = google.sheets({ version: 'v4', auth: client });
    const range = req.query.range || 'A1:Z100';
    const { data } = await sheets.spreadsheets.values.get({ spreadsheetId: req.params.id, range });
    res.json(data.values || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== DOCS =====
router.get('/docs', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const drive = google.drive({ version: 'v3', auth: client });
    const { data } = await drive.files.list({
      pageSize: 20, orderBy: 'modifiedTime desc',
      q: "mimeType='application/vnd.google-apps.document' and trashed = false",
      fields: 'files(id,name,modifiedTime,webViewLink,iconLink)',
    });
    res.json(data.files || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== FORMS =====
router.get('/forms', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const drive = google.drive({ version: 'v3', auth: client });
    const { data } = await drive.files.list({
      pageSize: 20, orderBy: 'modifiedTime desc',
      q: "mimeType='application/vnd.google-apps.form' and trashed = false",
      fields: 'files(id,name,modifiedTime,webViewLink,iconLink)',
    });
    res.json(data.files || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/forms/:id/responses', async (req, res) => {
  try {
    const { client } = await getClient(req);
    const forms = google.forms({ version: 'v1', auth: client });
    const { data } = await forms.responses.list({ formId: req.params.id });
    res.json(data.responses || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ADS =====
router.get('/ads/status', (req, res) => {
  res.json({
    configured: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    message: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
      ? 'Developer token configurado'
      : 'Google Ads requer um developer token aprovado pelo Google.',
  });
});

module.exports = router;
