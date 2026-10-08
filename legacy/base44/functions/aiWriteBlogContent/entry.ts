import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, focus_keyword, keywords } = await req.json();

    if (!title || !description) {
      return Response.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a comprehensive, SEO-optimized blog post with the following details:
      Title: ${title}
      Description: ${description}
      Focus Keyword: ${focus_keyword || 'accounting'}
      Additional Keywords: ${keywords || 'none'}
      
      Requirements:
      - Minimum 800 words
      - Use heading structure (H2, H3)
      - Include the focus keyword naturally at least 3 times
      - Add introduction and conclusion sections
      - Format with clear paragraphs
      - Write in Portuguese
      
      Return only the HTML content without <html>, <body> or <head> tags.`,
      add_context_from_internet: true
    });

    return Response.json({ content: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});