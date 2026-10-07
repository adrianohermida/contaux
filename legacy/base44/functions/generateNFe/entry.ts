import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get payload from automation trigger or direct call
    let payload = {};
    let tenantId = null;
    let invoiceId = null;

    try {
      const body = await req.json();
      payload = body;
      
      // From automation trigger (entity event)
      if (body.event && body.event.entity_id) {
        invoiceId = body.event.entity_id;
        tenantId = body.data?.tenant_id;
      }
      // From direct API call
      else if (body.invoiceId && body.tenantId) {
        invoiceId = body.invoiceId;
        tenantId = body.tenantId;
      }
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!invoiceId || !tenantId) {
      return Response.json({ error: 'Missing required fields: invoiceId, tenantId' }, { status: 400 });
    }

    // Fetch invoice data
    const invoice = await base44.asServiceRole.entities.Invoice.get(invoiceId);
    if (!invoice || invoice.tenant_id !== tenantId) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if NFe already exists for this invoice
    const existingNFe = await base44.asServiceRole.entities.TaxInvoice.filter({
      tenant_id: tenantId,
      client_id: invoice.client_id
    });
    
    const nfeExists = existingNFe.some(nfe => nfe.description && nfe.description.includes(invoice.invoice_number));
    if (nfeExists) {
      return Response.json({ 
        success: true, 
        message: 'NFe already exists for this invoice',
        skipped: true
      });
    }

    // Fetch client data
    const client = await base44.asServiceRole.entities.Client.get(invoice.client_id);
    if (!client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // Generate NFe number (simplified)
    const nfeNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const series = '001';
    const issueDate = new Date().toISOString().split('T')[0];

    const nfeData = {
      nfe_number: nfeNumber,
      series: series,
      issue_date: issueDate,
      client_id: client.id,
      amount: invoice.total_amount,
      status: 'draft',
      description: `NFe for Invoice #${invoice.invoice_number}`
    };

    // Create TaxInvoice record
    const taxInvoice = await base44.asServiceRole.entities.TaxInvoice.create({
      tenant_id: tenantId,
      ...nfeData
    });

    // Update original invoice status
    await base44.asServiceRole.entities.Invoice.update(invoiceId, { status: 'issued' });

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      tenant_id: tenantId,
      user_email: 'system@contaux.local',
      title: 'NFe Gerada',
      message: `NFe #${nfeNumber} gerada automaticamente para fatura #${invoice.invoice_number}`,
      type: 'success',
      priority: 'medium',
      related_entity: 'Invoice',
      related_entity_id: invoiceId,
      status: 'sent'
    });

    return Response.json({ success: true, taxInvoice });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});