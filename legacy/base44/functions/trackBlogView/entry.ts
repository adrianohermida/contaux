import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Validar parâmetros - aceitar blog_post_id, postId ou post_id
    const postId = body.blog_post_id || body.postId || body.post_id;
    const device = body.device || 'unknown';
    const source = body.source || 'direct';

    if (!postId) {
      return Response.json({ error: 'post_id ou blog_post_id obrigatório' }, { status: 400 });
    }

    // Obter o post
    const post = await base44.asServiceRole.entities.BlogPost.get(postId);
    if (!post) {
      return Response.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    // Atualizar views
    const newViews = (post.views || 0) + 1;
    await base44.asServiceRole.entities.BlogPost.update(postId, { views: newViews });

    // Registrar analytics
    await base44.asServiceRole.entities.BlogAnalytics.create({
      blog_post_id: postId,
      views: 1,
      unique_visitors: 1,
      device,
      source,
      date: new Date().toISOString().split('T')[0]
    });

    return Response.json({ 
      success: true,
      newViews,
      message: 'View rastreado com sucesso'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});