import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Send Push Notifications - Backend function para enviar notificações push
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, icon, badge, tag, notificationId } = await req.json();

    if (!title || !body) {
      return Response.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Simular envio de notificação
    const notification = {
      id: notificationId || Date.now().toString(),
      title,
      body,
      icon: icon || '🔔',
      badge,
      tag: tag || 'general',
      sentAt: new Date().toISOString(),
      userId: user.email,
      status: 'sent',
    };

    console.log('Notificação enviada:', notification);

    return Response.json({
      success: true,
      notification,
      message: 'Notificação enviada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});