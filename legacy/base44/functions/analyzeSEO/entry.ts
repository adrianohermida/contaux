import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { content, title, description, keywords = [] } = body;

    if (!content || !title) {
      return Response.json({ 
        error: 'Campos obrigatórios: content, title' 
      }, { status: 400 });
    }

    // Análise de SEO sem dependências externas
    const scores = {
      titleLength: title.length >= 30 && title.length <= 60 ? 100 : 70,
      titleKeywords: keywords.length > 0 ? 100 : 50,
      descriptionLength: description && description.length >= 120 && description.length <= 160 ? 100 : 70,
      contentLength: content.length >= 300 ? 100 : Math.min(70, Math.round((content.length / 300) * 100)),
      headingStructure: (content.match(/<h[1-6]/gi) || []).length > 0 ? 100 : 60,
      imagePresence: (content.match(/<img/gi) || []).length > 0 ? 100 : 60,
      linkStructure: (content.match(/<a /gi) || []).length > 0 ? 100 : 50,
      readability: analyzeReadability(content),
    };

    const seoScore = Math.round(Object.values(scores).reduce((a, b) => a + b) / Object.keys(scores).length);

    // Recomendações
    const recommendations = [];
    if (title.length < 30) recommendations.push('Título muito curto - aumente para 30-60 caracteres');
    if (title.length > 60) recommendations.push('Título muito longo - reduza para 30-60 caracteres');
    if (!description || description.length < 120) recommendations.push('Meta descrição ausente ou muito curta');
    if (content.length < 300) recommendations.push('Conteúdo muito curto - aumente para pelo menos 300 caracteres');
    if ((content.match(/<h[1-6]/gi) || []).length === 0) recommendations.push('Adicione títulos (H1, H2, H3) para melhor estrutura');
    if ((content.match(/<img/gi) || []).length === 0) recommendations.push('Adicione imagens ao conteúdo');

    return Response.json({ 
      success: true,
      seoScore,
      readabilityScore: scores.readability,
      scores,
      recommendations: recommendations.slice(0, 5),
      analysis: {
        title,
        contentLength: content.length,
        wordCount: content.split(/\s+/).length,
        headingCount: (content.match(/<h[1-6]/gi) || []).length,
        imageCount: (content.match(/<img/gi) || []).length,
        linkCount: (content.match(/<a /gi) || []).length,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function analyzeReadability(content) {
  // Análise simples de legibilidade baseada em características de texto
  const plainText = content.replace(/<[^>]*>/g, '');
  const sentences = plainText.split(/[.!?]+/).length;
  const words = plainText.split(/\s+/).length;
  const avgWordsPerSentence = words / sentences;

  let score = 100;
  if (avgWordsPerSentence > 25) score -= 20;
  if (avgWordsPerSentence > 30) score -= 20;
  if (plainText.length < 100) score -= 30;
  
  return Math.max(40, Math.min(100, score));
}