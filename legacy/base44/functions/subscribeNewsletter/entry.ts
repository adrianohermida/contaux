import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, source } = await req.json();

    if (!email || !source) {
      return Response.json({ error: 'Email e source são obrigatórios' }, { status: 400 });
    }

    // Verificar se o email já existe
    const existing = await base44.asServiceRole.entities.NewsletterSubscriber.filter({
      email: email
    });

    if (existing.length > 0) {
      return Response.json({ success: true, message: 'Email já inscrito', isNew: false });
    }

    // Criar novo subscriber
    await base44.asServiceRole.entities.NewsletterSubscriber.create({
      email: email,
      source: source,
      subscribed: true
    });

    return Response.json({ success: true, message: 'Inscrição realizada com sucesso', isNew: true });
  } catch (error) {
    console.error('Erro:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});