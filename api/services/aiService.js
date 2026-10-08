/**
 * Serviço de IA — Assistente da Base de Conhecimento.
 *
 * Faz busca inteligente na base de conhecimento e retorna resultados relevantes
 * formatados como resposta. Usa ranking por relevância (ts_rank do PostgreSQL)
 * e extrai trechos do conteúdo que correspondem à pergunta.
 *
 * Para ativar respostas com LLM, deploy a backend function "aiAsk":
 *   npx base44 functions deploy aiAsk
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

/** Verifica se o LLM via backend function está configurado */
function isLLMConfigured() {
  return !!getAppId() && !!getServiceToken();
}

/**
 * Busca itens relevantes na base de conhecimento usando ranking do PostgreSQL.
 * Combina busca textual (ts_rank) com ILIKE para máxima cobertura.
 */
async function searchKnowledgeBase(question, limit = 5) {
  // Busca com ILIKE — cobre termos parciais
  const ilikeResult = await query(
    `SELECT id, title, summary, content, type, source, tags,
            ts_headline('portuguese', content, plainto_tsquery('portuguese', $1),
              'MaxFragments=2, MinWords=5, MaxWords=25, HighlightAll=false') AS excerpt
     FROM knowledge_base
     WHERE (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1)
     AND (status = 'published' OR status IS NULL)
     ORDER BY
       CASE WHEN title ILIKE $1 THEN 0 ELSE 1 END,
       ts_rank(to_tsvector('portuguese', content), plainto_tsquery('portuguese', $1)) DESC,
       id DESC
     LIMIT $2`,
    [`%${question}%`, limit],
  );

  return ilikeResult.rows;
}

/**
 * Tenta chamar a backend function "aiAsk" deployada na Base44.
 * Retorna null se a função não estiver deployada ou falhar.
 */
async function tryLLMResponse(question, contextText) {
  if (!isLLMConfigured()) return null;

  const appId = getAppId();
  const serviceToken = getServiceToken();
  const serverUrl = process.env.BASE44_API_URL || 'https://base44.app';

  try {
    const response = await fetch(`${serverUrl}/api/apps/${appId}/functions/aiAsk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceToken}`,
        'X-App-Id': appId,
      },
      body: JSON.stringify({ question, context: contextText }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) return null;

    return typeof data.answer === 'string' ? data.answer : JSON.stringify(data.answer);
  } catch {
    return null;
  }
}

/** Remove tags HTML do trecho extraído pelo ts_headline */
function stripHtml(text) {
  return (text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Monta uma resposta inteligente a partir dos resultados da busca,
 * sem usar LLM. Extrai trechos relevantes e formata como resposta.
 */
function buildSearchAnswer(sources) {
  if (sources.length === 0) {
    return 'Não encontrei informações sobre este tema na Base de Conhecimento. Tente reformular sua pergunta ou use termos mais específicos (ex: "NBC TG", "tributário", "LGPD").';
  }

  const parts = sources.map((s, i) => {
    const rawExcerpt = s.excerpt || s.summary || (s.content || '').substring(0, 300);
    const excerpt = stripHtml(rawExcerpt);
    const typeLabel = {
      article: 'Artigo',
      legislation: 'Legislação',
      book: 'Livro/PDF',
      faq: 'FAQ',
    }[s.type] || 'Documento';

    return `📄 **${i + 1}. ${s.title}** (${typeLabel})\n${excerpt}${excerpt.endsWith('...') ? '' : '...'}`;
  });

  const header = sources.length === 1
    ? 'Encontrei **1 item** relacionado à sua pergunta:'
    : `Encontrei **${sources.length} itens** relacionados à sua pergunta:`;

  return `${header}\n\n${parts.join('\n\n')}\n\n_Acesse o item completo na lista acima para mais detalhes._`;
}

/**
 * Responde uma pergunta do usuário com base na Base de Conhecimento.
 * Tenta usar LLM via backend function; se indisponível, usa busca inteligente.
 * @param {string} question - Pergunta do usuário
 * @returns {Promise<{answer: string, sources: array, configured: boolean}>}
 */
async function ask(question) {
  // Busca contexto na base de conhecimento
  const sources = await searchKnowledgeBase(question);

  // Constrói contexto para o LLM (se disponível)
  const contextText = sources.length > 0
    ? sources.map((s, i) =>
        `[${i + 1}] ${s.title}\n${s.summary || ''}\n${(s.content || '').substring(0, 2000)}`
      ).join('\n\n---\n\n')
    : '';

  // Tenta resposta via LLM (backend function deployada)
  const llmAnswer = await tryLLMResponse(question, contextText);

  if (llmAnswer) {
    return {
      configured: true,
      answer: llmAnswer,
      sources: sources.map((s) => ({ title: s.title, type: s.type, source: s.source })),
    };
  }

  // Fallback: resposta baseada em busca inteligente
  return {
    configured: false,
    answer: buildSearchAnswer(sources),
    sources: sources.map((s) => ({ title: s.title, type: s.type, source: s.source })),
  };
}

module.exports = { ask, isConfigured: isLLMConfigured };
