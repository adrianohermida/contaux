import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, type, title, message, userEmail, relatedEntity, relatedEntityId, priority = 'medium' } = await req.json();

    if (!tenantId || !type || !title || !message || !userEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create notification record
    await base44.entities.Notification.create({
      tenant_id: tenantId,
      user_email: userEmail,
      title,
      message,
      type,
      priority,
      related_entity: relatedEntity,
      related_entity_id: relatedEntityId,
      status: 'sent'
    });

    // Send email notification if priority is high
    if (priority === 'high' || priority === 'urgent') {
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: `[${type.toUpperCase()}] ${title}`,
        body: `${message}\n\nTenant: ${tenantId}`
      });
    }

    return Response.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});