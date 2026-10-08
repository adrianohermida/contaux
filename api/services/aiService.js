/**
 * Serviço de IA — integração com OpenAI para o assistente da Base de Conhecimento.
 * Usa a API de Chat Completions para responder perguntas com base no conteúdo da KB.
 */
const { query } = require('../db');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/** Verifica se a IA está configurada */
function isConfigured() {
  return !!OPENAI_API_KEY;
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
 * Responde uma pergunta do usuário com base na Base de Conhecimento.
 * @param {string} question - Pergunta do usuário
 * @returns {Promise<{answer: string, sources: array, configured: boolean}>}
 */
async function ask(question) {
  if (!isConfigured()) {
    return {
      configured: false,
      answer: 'O assistente de IA não está configurado. Adicione a chave da API OpenAI (OPENAI_API_KEY) nas configurações de secrets.',
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

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
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
    console.error('Erro na API OpenAI:', err);
    throw new Error('Erro ao consultar a IA');
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
