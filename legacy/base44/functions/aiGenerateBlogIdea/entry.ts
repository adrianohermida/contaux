import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, keywords } = await req.json();

    if (!topic) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 creative and SEO-optimized blog post ideas about "${topic}". 
      Keywords to include: ${keywords || 'general'}
      
      Return a JSON array with exactly 5 ideas, each containing:
      - title (compelling blog title)
      - description (1-2 sentence summary)
      - focus_keyword (main SEO keyword)
      
      Format: [{"title": "...", "description": "...", "focus_keyword": "..."}]`,
      response_json_schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            focus_keyword: { type: 'string' }
          }
        }
      }
    });

    return Response.json({ ideas: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});