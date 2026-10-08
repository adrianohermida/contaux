import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, keywords } = await req.json();

    if (!title) {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }

    const response = await base44.integrations.Core.GenerateImage({
      prompt: `Create a professional and attractive blog header image for the article titled "${title}".
      Keywords/Topics: ${keywords || 'accounting'}
      
      Style: Modern, professional, suitable for accounting/law firm website
      Dimensions: 16:9 aspect ratio
      Elements: Include relevant icons or visuals related to the topic, clean design, professional colors`,
    });

    return Response.json({ 
      image_url: response.url
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});