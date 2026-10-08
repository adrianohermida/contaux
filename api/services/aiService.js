/**
 * Serviço de IA — integração com o Base44 AI Gateway.
 * Usa o gateway OpenAI-compatible da Base44 para responder perguntas
 * com base no conteúdo da Base de Conhecimento.
 *
 * O app ID é extraído automaticamente de BASE44_PUBLIC_HOST_SUFFIX.
 * O token de serviço (BASE44_SERVICE_TOKEN) deve ser configurado nos secrets.
 */
const { query } = require('../db');

/** Extrai o App ID do BASE44_PUBLIC_HOST_SUFFIX (formato: {appId}--b-{branchId}...) */
function getAppId() {
  const suffix = process.env.BASE44_PUBLIC_HOST_SUFFIX || '';
  const appId = suffix.split('--')[0];
  return appId || process.env.BASE44_APP_ID || '';
}

/** URL base do gateway AI da Base44 */
function getGatewayBaseURL() {
  const appId = getAppId();
  const serverUrl = process.env.BASE44_API_URL || 'https://base44.app';
  return `${serverUrl}/api/apps/${appId}/ai/openai/v1`;
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
 * usando o Base44 AI Gateway (OpenAI-compatible).
 * @param {string} question - Pergunta do usuário
 * @returns {Promise<{answer: string, sources: array, configured: boolean}>}
 */
async function ask(question) {
  if (!isConfigured()) {
    return {
      configured: false,
      answer: 'O assistente de IA não está configurado. Configure o BASE44_SERVICE_TOKEN nos secrets da plataforma Base44 para ativar o assistente.',
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
    : 'Nenhum item relevante encontrado na base de conhecimento.';

  const systemPrompt = `Você é um assistente especialista em contabilidade e legislação brasileira, integrado à Base de Conhecimento da Contaux Contadoria. Responda em português brasileiro, de forma clara e objetiva. Use o contexto fornecido da base de conhecimento para fundamentar suas respostas. Se a pergunta não estiver relacionada ao contexto, indique que não há informação suficiente na base de conhecimento.\n\nContexto da Base de Conhecimento:\n${contextText}`;

  const baseURL = getGatewayBaseURL();
  const token = getServiceToken();

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: 'automatic',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erro no Base44 AI Gateway:', err);
    if (response.status === 403) {
      return {
        configured: false,
        answer: 'O app precisa estar publicado na Base44 para usar o AI Gateway. Publique o app e tente novamente.',
        sources: [],
      };
    }
    throw new Error('Erro ao consultar a IA via Base44 AI Gateway');
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || 'Sem resposta.';

  return {
    configured: true,
    answer,
    sources: sources.map((s) => ({ title: s.title, type: s.type, source: s.source })),
  };
}

module.exports = { ask, isConfigured };
