import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Alerta automático para invoices vencidas e próximas do vencimento
 * Executado diariamente
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Busca invoices próximas do vencimento ou vencidas
    const invoices = await base44.asServiceRole.entities.Invoice.list();
    
    for (const invoice of invoices) {
      if (!invoice.due_date) continue;

      const dueDate = new Date(invoice.due_date);
      const isOverdue = dueDate < today && invoice.status !== 'paid';
      const isDueSoon = dueDate <= sevenDaysLater && dueDate >= today && invoice.status !== 'paid';

      if (!isOverdue && !isDueSoon) continue;

      // Busca cliente para obter email
      const client = await base44.asServiceRole.entities.Client.list();
      const clientData = client.find(c => c.id === invoice.client_id);
      if (!clientData?.email) continue;

      // Cria notificação
      const notifType = isOverdue ? 'warning' : 'alert';
      const title = isOverdue ? '⚠️ Fatura Vencida' : '📅 Fatura vence em breve';
      const message = isOverdue 
        ? `Fatura #${invoice.invoice_number} venceu em ${new Date(invoice.due_date).toLocaleDateString('pt-BR')}`
        : `Fatura #${invoice.invoice_number} vence em ${new Date(invoice.due_date).toLocaleDateString('pt-BR')}`;

      await base44.asServiceRole.entities.Notification.create({
        tenant_id: invoice.tenant_id,
        user_email: clientData.email,
        title,
        message,
        type: notifType,
        priority: isOverdue ? 'high' : 'medium',
        related_entity: 'Invoice',
        related_entity_id: invoice.id,
        is_read: false,
        status: 'pending'
      });

      // Envia email via integração
      await base44.integrations.Core.SendEmail({
        to: clientData.email,
        subject: title,
        body: `${message}\n\nValor: R$ ${invoice.total_amount.toFixed(2)}`
      });
    }

    return Response.json({ success: true, processed: invoices.length });
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});