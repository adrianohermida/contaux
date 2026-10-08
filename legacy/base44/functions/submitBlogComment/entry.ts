import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Validar campos obrigatórios
    const postId = body.blog_post_id || body.postId || body.post_id;
    const authorName = body.author_name || body.authorName;
    const authorEmail = body.author_email || body.authorEmail;
    const content = body.content;

    if (!postId || !authorName || !authorEmail || !content) {
      return Response.json({ 
        error: 'Campos obrigatórios: blog_post_id, author_name, author_email, content' 
      }, { status: 400 });
    }

    // Validar se post existe
    const post = await base44.asServiceRole.entities.BlogPost.get(postId);
    if (!post) {
      return Response.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    // Criar comentário
    const comment = await base44.asServiceRole.entities.BlogComment.create({
      blog_post_id: postId,
      author_name: authorName,
      author_email: authorEmail,
      content: content,
      status: 'pending', // Requer moderação
      rating: body.rating || 0,
      helpful_count: 0
    });

    return Response.json({ 
      success: true,
      comment,
      message: 'Comentário enviado para moderação'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});