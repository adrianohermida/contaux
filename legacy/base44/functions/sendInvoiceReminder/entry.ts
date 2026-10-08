import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const sendReminderForInvoice = async (base44, invoice, client) => {
  const dueDate = new Date(invoice.due_date);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  // Skip invoices that are paid or cancelled
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return { skipped: true };
  }

  if (daysUntilDue <= 0) {
    const daysPast = Math.abs(daysUntilDue);
    const emailBody = `
      A fatura #${invoice.invoice_number} está ATRASADA há ${daysPast} dia(s).
      
      Valor: R$ ${invoice.total_amount.toFixed(2)}
      Data de vencimento: ${dueDate.toLocaleDateString('pt-BR')}
      
      Por favor, regularize imediatamente.
    `;

    await base44.integrations.Core.SendEmail({
      to: client.email,
      subject: `[URGENTE] Fatura Atrasada #${invoice.invoice_number}`,
      body: emailBody
    });
  } else if (daysUntilDue <= 7) {
    const emailBody = `
      A fatura #${invoice.invoice_number} vence em ${daysUntilDue} dia(s).
      
      Valor: R$ ${invoice.total_amount.toFixed(2)}
      Data de vencimento: ${dueDate.toLocaleDateString('pt-BR')}
      
      Lembramos que o pagamento é necessário.
    `;

    await base44.integrations.Core.SendEmail({
      to: client.email,
      subject: `Fatura vencendo em breve #${invoice.invoice_number}`,
      body: emailBody
    });
  } else {
    return { skipped: true };
  }

  // Create notification
  await base44.asServiceRole.entities.Notification.create({
    tenant_id: invoice.tenant_id,
    user_email: client.email,
    title: 'Lembrete de Fatura',
    message: `Fatura #${invoice.invoice_number} vence em ${daysUntilDue} dia(s)`,
    type: daysUntilDue <= 0 ? 'alert' : 'warning',
    priority: daysUntilDue <= 0 ? 'urgent' : 'high',
    related_entity: 'Invoice',
    related_entity_id: invoice.id,
    status: 'sent'
  });

  return { success: true, daysUntilDue };
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let tenantId, invoiceId;
    
    try {
      const body = await req.json();
      tenantId = body.tenantId;
      invoiceId = body.invoiceId;
    } catch {
      // Empty body - automated run
    }

    // Case 1: Direct call with specific invoice
    if (invoiceId && tenantId) {
      const invoice = await base44.asServiceRole.entities.Invoice.get(invoiceId);
      if (!invoice || invoice.tenant_id !== tenantId) {
        return Response.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const client = await base44.asServiceRole.entities.Client.get(invoice.client_id);
      if (!client) {
        return Response.json({ error: 'Client not found' }, { status: 404 });
      }

      const result = await sendReminderForInvoice(base44, invoice, client);
      return Response.json({ success: !result.skipped, ...result });
    }

    // Case 2: Automated run - process all invoices due soon or overdue
    const allInvoices = await base44.asServiceRole.entities.Invoice.list('-created_date', 1000);
    let processed = 0;
    let sent = 0;

    for (const invoice of allInvoices) {
      try {
        const client = await base44.asServiceRole.entities.Client.get(invoice.client_id);
        if (client) {
          const result = await sendReminderForInvoice(base44, invoice, client);
          processed++;
          if (result.success) sent++;
        }
      } catch (e) {
        console.error(`Error processing invoice ${invoice.id}:`, e.message);
      }
    }

    return Response.json({ 
      success: true, 
      message: `Processed ${processed} invoices, sent ${sent} reminders`,
      processed,
      sent 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});