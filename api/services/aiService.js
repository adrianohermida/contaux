/**
 * Serviço de IA — Assistente da Base de Conhecimento.
 *
 * RAG (Retrieval-Augmented Generation): busca itens relevantes na base de
 * conhecimento via PostgreSQL e usa o OpenAI Chat Completions API para gerar
 * uma resposta natural em português. Sem OPENAI_API_KEY, cai para busca textual.
 */
const { query } = require('../db');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/** Verifica se o LLM (OpenAI) está configurado */
function isLLMConfigured() {
  return !!OPENAI_API_KEY;
}

/**
 * Busca itens relevantes na base de conhecimento usando ranking do PostgreSQL.
 * Combina busca textual (ts_rank) com ILIKE para máxima cobertura.
 */
async function searchKnowledgeBase(question, tenantIds = null, limit = 5) {
  // Busca com ILIKE — cobre termos parciais
  // Filtra por tenant quando tenantIds é fornecido (isolamento multi-tenant)
  if (tenantIds && tenantIds.length > 0) {
    const ilikeResult = await query(
      `SELECT id, title, summary, content, type, source, tags,
              ts_headline('portuguese', content, plainto_tsquery('portuguese', $1),
                'MaxFragments=2, MinWords=5, MaxWords=25, HighlightAll=false') AS excerpt
       FROM knowledge_base
       WHERE (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1)
       AND (status = 'published' OR status IS NULL)
       AND (tenant_id = ANY($2::int[]) OR tenant_id IS NULL)
       ORDER BY
         CASE WHEN title ILIKE $1 THEN 0 ELSE 1 END,
         ts_rank(to_tsvector('portuguese', content), plainto_tsquery('portuguese', $1)) DESC,
         id DESC
       LIMIT $3`,
      [`%${question}%`, tenantIds, limit],
    );
    return ilikeResult.rows;
  }

  // Sem filtro de tenant (fallback — não deve ocorrer em rotas autenticadas)
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

const SYSTEM_PROMPT = `Você é o Assistente Contaux, um assistente de contabilidade brasileira integrado à plataforma Contaux Contadoria.
Responda em português do Brasil, de forma clara e objetiva, com base exclusivamente no contexto fornecido da Base de Conhecimento.
Se o contexto não contiver informação suficiente, diga que não encontrou dados sobre o tema e sugira termos mais específicos.
Cite as fontes pelo título quando relevante. Não invente informações.`;

/**
 * Chama a API do OpenAI (Chat Completions) com o contexto da base de conhecimento.
 * Retorna null se a API não estiver configurada ou falhar.
 */
async function tryLLMResponse(question, contextText, conversationHistory = [], systemPrompt = SYSTEM_PROMPT) {
  if (!isLLMConfigured()) return null;

  const messages = [
    { role: 'system', content: systemPrompt },
  ];

  // Inclui histórico da conversa atual (últimas 10 mensagens) para contexto contínuo
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.text });
    }
  }

  // Pergunta atual com contexto da base de conhecimento
  messages.push({
    role: 'user',
    content: contextText
      ? `Contexto da Base de Conhecimento:\n\n${contextText}\n\n---\n\nPergunta: ${question}`
      : `Pergunta: ${question}\n\n(Obs: nenhum item relevante foi encontrado na base de conhecimento para esta pergunta.)`,
  });

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.error('[aiService] OpenAI API erro:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    return answer || null;
  } catch (err) {
    console.error('[aiService] Erro ao chamar OpenAI:', err.message);
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
async function ask(question, userContext = null) {
  // Busca contexto na base de conhecimento (com isolamento por tenant)
  const tenantIds = userContext?.tenantIds || null;
  const conversationHistory = userContext?.conversationHistory || [];
  const systemPrompt = userContext?.systemPrompt || SYSTEM_PROMPT;
  const sources = await searchKnowledgeBase(question, tenantIds);

  // Constrói contexto para o LLM (se disponível)
  const contextText = sources.length > 0
    ? sources.map((s, i) =>
        `[${i + 1}] ${s.title}\n${s.summary || ''}\n${(s.content || '').substring(0, 2000)}`
      ).join('\n\n---\n\n')
    : '';

  // Tenta resposta via LLM (backend function deployada)
  const llmAnswer = await tryLLMResponse(question, contextText, conversationHistory, systemPrompt);

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
