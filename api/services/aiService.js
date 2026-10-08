/**
 * Serviço de IA — usa o Base44 AI via backend function.
 *
 * O Base44 AI Gateway é bloqueado para apps importados (routing restriction),
 * então a chamada é feita através de uma backend function deployada na Base44
 * (base44/functions/aiAsk/entry.ts) que usa InvokeLLM internamente.
 *
 * Requer:
 * - BASE44_SERVICE_TOKEN: token de serviço da Base44 (secret)
 * - BASE44_PUBLIC_HOST_SUFFIX: injetado pela plataforma (contém o app ID)
 * - Backend function "aiAsk" deployada via: npx base44 functions deploy aiAsk
 */
const { query } = require('../db');

/** Extrai o App ID do BASE44_PUBLIC_HOST_SUFFIX (formato: {appId}--b-{branchId}...) */
function getAppId() {
  const suffix = process.env.BASE44_PUBLIC_HOST_SUFFIX || '';
  return suffix.split('--')[0] || process.env.BASE44_APP_ID || '';
}

/** Token de autenticação do serviço (service role) */
function getServiceToken() {
  return process.env.BASE44_SERVICE_TOKEN || '';
}

/** Verifica se a IA está configurada */
function isConfigured() {
  return !!getAppId() && !!getServiceToken();
}

/**
 * Busca itens relevantes na base de conhecimento para usar como contexto.
 * Usa busca textual simples (ILIKE) nos campos title, summary e content.
 */
async function searchContext(question, limit = 5) {
  const result = await query(
    `SELECT title, summary, content, type, source
     FROM knowledge_base
     WHERE (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1)
     AND (status = 'published' OR status IS NULL)
     ORDER BY id DESC
     LIMIT $2`,
    [`%${question}%`, limit],
  );
  return result.rows;
}

/**
 * Responde uma pergunta do usuário com base na Base de Conhecimento,
 * usando a IA nativa da Base44 via backend function.
 * @param {string} question - Pergunta do usuário
 * @returns {Promise<{answer: string, sources: array, configured: boolean}>}
 */
async function ask(question) {
  if (!isConfigured()) {
    return {
      configured: false,
      answer: 'O assistente de IA não está configurado. Configure o BASE44_SERVICE_TOKEN nos secrets da plataforma Base44 e faça o deploy da backend function "aiAsk" (npx base44 functions deploy aiAsk).',
      sources: [],
    };
  }

  // Busca contexto na base de conhecimento
  const sources = await searchContext(question);

  // Constrói o contexto a partir dos itens encontrados
  const contextText = sources.length > 0
    ? sources.map((s, i) =>
        `[${i + 1}] ${s.title}\n${s.summary || ''}\n${(s.content || '').substring(0, 2000)}`
      ).join('\n\n---\n\n')
    : '';

  const appId = getAppId();
  const serviceToken = getServiceToken();
  const serverUrl = process.env.BASE44_API_URL || 'https://base44.app';

  // Chama a backend function "aiAsk" deployada na Base44
  const response = await fetch(`${serverUrl}/api/apps/${appId}/functions/aiAsk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceToken}`,
      'X-App-Id': appId,
    },
    body: JSON.stringify({ question, context: contextText }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erro ao chamar backend function aiAsk:', err);
    if (response.status === 404) {
      return {
        configured: false,
        answer: 'A backend function "aiAsk" ainda não foi deployada. Execute: npx base44 functions deploy aiAsk',
        sources: [],
      };
    }
    throw new Error('Erro ao consultar a IA via Base44');
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    configured: true,
    answer: data.answer || 'Sem resposta.',
    sources: sources.map((s) => ({ title: s.title, type: s.type, source: s.source })),
  };
}

module.exports = { ask, isConfigured };
