/**
 * Convert Quote to Invoice
 * Creates an invoice from a quote and updates quote status
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quote_id, tenant_id } = await req.json();

    if (!quote_id || !tenant_id) {
      return Response.json({ error: 'Missing quote_id or tenant_id' }, { status: 400 });
    }

    // Fetch quote
    const quotes = await base44.entities.Quote.filter({
      id: quote_id,
      tenant_id: tenant_id,
    });

    if (!quotes.length) {
      return Response.json({ error: 'Quote not found' }, { status: 404 });
    }

    const quote = quotes[0];

    if (quote.status === 'converted') {
      return Response.json({ error: 'Quote already converted' }, { status: 400 });
    }

    if (quote.status !== 'accepted') {
      return Response.json({ error: 'Only accepted quotes can be converted' }, { status: 400 });
    }

    // Create invoice from quote
    const invoiceData = {
      tenant_id: tenant_id,
      client_id: quote.client_id,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      currency: quote.currency,
      status: 'sent',
      items: quote.items.map(item => ({
        ...item,
        product_id: item.product_id,
      })),
      subtotal: quote.subtotal,
      discount_percent: quote.discount_percent || 0,
      discount_amount: quote.discount_amount || 0,
      tax_amount: quote.tax_amount || 0,
      total_amount: quote.total_amount,
      notes: quote.notes || '',
      paid_amount: 0,
    };

    // Create invoice
    const invoice = await base44.entities.Invoice.create(invoiceData);

    // Update quote with invoice reference and status
    await base44.entities.Quote.update(quote_id, {
      status: 'converted',
      invoice_id: invoice.id,
    });

    return Response.json({
      success: true,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      quote_number: quote.quote_number,
    });
  } catch (error) {
    console.error('convertQuoteToInvoice error:', error);
    return Response.json(
      { error: error.message || 'Failed to convert quote to invoice' },
      { status: 500 }
    );
  }
});