import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { question, context } = await req.json();

    if (!question || !question.trim()) {
      return Response.json({ error: "Pergunta é obrigatória" }, { status: 400 });
    }

    const systemPrompt = `Você é um assistente especialista em contabilidade e legislação brasileira, integrado à Base de Conhecimento da Contaux Contadoria. Responda em português brasileiro, de forma clara e objetiva. Use o contexto fornecido da base de conhecimento para fundamentar suas respostas. Se a pergunta não estiver relacionada ao contexto, indique que não há informação suficiente na base de conhecimento.`;

    const fullPrompt = context
      ? `${systemPrompt}\n\nContexto da Base de Conhecimento:\n${context}\n\nPergunta: ${question}`
      : `${systemPrompt}\n\nPergunta: ${question}`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
    });

    return Response.json({ answer: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
