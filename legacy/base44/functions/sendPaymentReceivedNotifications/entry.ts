import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Notificação ao receber pagamento
 * Disparada automaticamente quando payment é criada/confirmada
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { payment } = body;

    if (!payment || payment.status !== 'confirmed') {
      return Response.json({ success: false, reason: 'Invalid payment' });
    }

    // Busca invoice associada
    const invoices = await base44.asServiceRole.entities.Invoice.list();
    const invoice = invoices.find(i => i.id === payment.invoice_id);
    if (!invoice) return Response.json({ success: false });

    // Busca cliente
    const clients = await base44.asServiceRole.entities.Client.list();
    const client = clients.find(c => c.id === invoice.client_id);
    if (!client?.email) return Response.json({ success: false });

    // Cria notificação
    await base44.asServiceRole.entities.Notification.create({
      tenant_id: payment.tenant_id,
      user_email: client.email,
      title: '✅ Pagamento Recebido',
      message: `Pagamento de R$ ${payment.amount.toFixed(2)} recebido com sucesso`,
      type: 'success',
      priority: 'medium',
      related_entity: 'Payment',
      related_entity_id: payment.id,
      is_read: false,
      status: 'pending'
    });

    // Envia email
    await base44.integrations.Core.SendEmail({
      to: client.email,
      subject: '✅ Pagamento Recebido',
      body: `Confirmamos o recebimento de R$ ${payment.amount.toFixed(2)} referente à Fatura #${invoice.invoice_number}`
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});