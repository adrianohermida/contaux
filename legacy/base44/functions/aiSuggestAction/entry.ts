import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backend function para gerar sugestões de ações via AI
 * Chamado pelo SuggestionEngine
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { entityType, contextData } = payload;

    if (!entityType || !contextData) {
      return Response.json(
        { error: 'Missing entityType or contextData' },
        { status: 400 }
      );
    }

    // Usar InvokeLLM para gerar sugestões
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: buildPrompt(entityType, contextData),
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                action: { type: 'string' },
                priority: { type: 'string' },
                confidence: { type: 'number' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: response.suggestions || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildPrompt(entityType, contextData) {
  const contexts = {
    Invoice: `Analisando Fatura - Gere sugestões para otimizar gestão de cobrança:\n${JSON.stringify(contextData)}`,
    Client: `Analisando Cliente - Gere sugestões para melhorar relacionamento:\n${JSON.stringify(contextData)}`,
    Payment: `Analisando Pagamento - Gere sugestões para otimizar fluxo de caixa:\n${JSON.stringify(contextData)}`,
    LegalProcess: `Analisando Processo Jurídico - Gere sugestões para aceleração:\n${JSON.stringify(contextData)}`
  };

  return contexts[entityType] || `Gere 3-5 sugestões acionáveis:\n${JSON.stringify(contextData)}`;
}