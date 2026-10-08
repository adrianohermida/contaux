import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Validar parâmetro - aceitar blogPostId, post_id ou blog_post_id
    const postId = body.blogPostId || body.post_id || body.blog_post_id;
    if (!postId) {
      return Response.json({ error: 'blogPostId ou blog_post_id obrigatório' }, { status: 400 });
    }

    // Obter o post
    const post = await base44.asServiceRole.entities.BlogPost.get(postId);
    if (!post) {
      return Response.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    // Obter subscribers ativos
    const subscribers = await base44.asServiceRole.entities.NewsletterSubscriber.filter({
      subscribed: true
    });

    if (subscribers.length === 0) {
      return Response.json({ 
        sent: 0,
        message: 'Nenhum subscriber encontrado'
      });
    }

    // Enviar para cada subscriber
    const sent = [];
    const postData = post.data || post;
    
    for (const subscriber of subscribers) {
      const emailBody = `
        <h2>${postData.title || 'Novo artigo'}</h2>
        <p>${postData.excerpt || postData.description || ''}</p>
        <a href="https://hermidamaia.adv.br/blog/${postData.slug || postId}">
          Leia o artigo completo
        </a>
      `;

      await base44.integrations.Core.SendEmail({
        to: subscriber.email,
        subject: `Novo artigo: ${postData.title || 'Novo conteúdo'}`,
        body: emailBody,
        from_name: 'Contaux Blog'
      });

      sent.push(subscriber.email);
    }

    return Response.json({ 
      success: true,
      sent: sent.length,
      message: `Newsletter enviada para ${sent.length} subscribers`,
      sentTo: sent
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});