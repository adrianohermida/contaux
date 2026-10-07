/**
 * Validate Invoice Number Uniqueness
 * Backend function to validate invoice numbers per tenant
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceNumber, tenantId, excludeInvoiceId } = await req.json();

    if (!invoiceNumber || !tenantId) {
      return Response.json({ 
        error: 'Missing required fields: invoiceNumber, tenantId' 
      }, { status: 400 });
    }

    // Check if invoice number already exists in the tenant
    const existing = await base44.asServiceRole.entities.Invoice.filter({
      tenant_id: tenantId,
      invoice_number: invoiceNumber
    });

    // Filter out the current invoice if we're updating
    const duplicate = existing.find(inv => 
      !excludeInvoiceId || inv.id !== excludeInvoiceId
    );

    if (duplicate) {
      return Response.json({
        valid: false,
        message: `Número de fatura ${invoiceNumber} já existe neste workspace`
      });
    }

    return Response.json({
      valid: true,
      message: 'Número de fatura disponível'
    });

  } catch (error) {
    console.error('Error validating invoice number:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});