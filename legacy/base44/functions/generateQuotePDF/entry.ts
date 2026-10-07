/**
 * Generate Quote PDF
 * Creates a PDF file from quote data with items, calculations, and terms
 */

import { jsPDF } from 'npm:jspdf@4.0.0';
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

    // Fetch client details
    const clients = await base44.entities.Client.filter({
      id: quote.client_id,
      tenant_id: tenant_id,
    });
    const client = clients[0];

    // Create PDF
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('COTAÇÃO', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Nº: ${quote.quote_number}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Data: ${new Date(quote.quote_date).toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Válida até: ${new Date(quote.valid_until).toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Moeda: ${quote.currency}`, 20, yPosition);
    yPosition += 15;

    // Client Info
    doc.setFontSize(11);
    doc.text('Cliente:', 20, yPosition);
    yPosition += 7;
    doc.setFontSize(10);
    if (client) {
      doc.text(client.company_name, 20, yPosition);
      yPosition += 5;
      if (client.email) {
        doc.text(`Email: ${client.email}`, 20, yPosition);
        yPosition += 5;
      }
      if (client.phone) {
        doc.text(`Telefone: ${client.phone}`, 20, yPosition);
        yPosition += 5;
      }
    }
    yPosition += 10;

    // Items Table
    doc.setFontSize(11);
    doc.text('Itens:', 20, yPosition);
    yPosition += 10;

    // Table headers
    doc.setFontSize(9);
    doc.setFillColor(240, 240, 240);
    const colWidths = { desc: 80, qty: 20, price: 30, subtotal: 30 };
    const startX = 20;

    doc.rect(startX, yPosition - 5, colWidths.desc, 5, 'F');
    doc.rect(startX + colWidths.desc, yPosition - 5, colWidths.qty, 5, 'F');
    doc.rect(startX + colWidths.desc + colWidths.qty, yPosition - 5, colWidths.price, 5, 'F');
    doc.rect(
      startX + colWidths.desc + colWidths.qty + colWidths.price,
      yPosition - 5,
      colWidths.subtotal,
      5,
      'F'
    );

    doc.text('Descrição', startX + 2, yPosition);
    doc.text('Qtd', startX + colWidths.desc + 2, yPosition);
    doc.text('Valor', startX + colWidths.desc + colWidths.qty + 2, yPosition);
    doc.text('Subtotal', startX + colWidths.desc + colWidths.qty + colWidths.price + 2, yPosition);
    yPosition += 8;

    // Items
    quote.items?.forEach((item) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(item.description.substring(0, 30), startX + 2, yPosition);
      doc.text(item.quantity.toString(), startX + colWidths.desc + 2, yPosition);
      doc.text(item.unit_price.toFixed(2), startX + colWidths.desc + colWidths.qty + 2, yPosition);
      doc.text(item.subtotal.toFixed(2), startX + colWidths.desc + colWidths.qty + colWidths.price + 2, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Calculations
    doc.setFontSize(10);
    const calcX = startX + colWidths.desc + colWidths.qty + 20;

    doc.text(`Subtotal: ${quote.subtotal?.toFixed(2) || '0.00'}`, calcX, yPosition);
    yPosition += 6;

    if (quote.discount_amount > 0) {
      doc.text(`Desconto: -${quote.discount_amount.toFixed(2)}`, calcX, yPosition);
      yPosition += 6;
    }

    if (quote.tax_amount > 0) {
      doc.text(`Imposto: +${quote.tax_amount.toFixed(2)}`, calcX, yPosition);
      yPosition += 6;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: ${quote.total_amount?.toFixed(2) || '0.00'}`, calcX, yPosition);
    yPosition += 12;

    // Terms
    if (quote.terms) {
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text('Termos e Condições:', 20, yPosition);
      yPosition += 5;

      const wrappedTerms = doc.splitTextToSize(quote.terms, 170);
      doc.text(wrappedTerms, 20, yPosition);
      yPosition += wrappedTerms.length * 4;
    }

    // Notes
    if (quote.notes) {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(9);
      doc.text('Notas:', 20, yPosition);
      yPosition += 5;

      const wrappedNotes = doc.splitTextToSize(quote.notes, 170);
      doc.text(wrappedNotes, 20, yPosition);
    }

    // Save to bytes
    const pdfBytes = doc.output('arraybuffer');

    // Upload to file storage
    const fileUploadRes = await base44.integrations.Core.UploadFile({
      file: new Blob([pdfBytes], { type: 'application/pdf' }),
    });

    return Response.json({
      success: true,
      quote_number: quote.quote_number,
      file_url: fileUploadRes.file_url,
    });
  } catch (error) {
    console.error('generateQuotePDF error:', error);
    return Response.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
});