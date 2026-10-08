/**
 * Generate Invoice PDF
 * Backend function to generate and return invoice PDF
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId, tenantId } = await req.json();

    if (!invoiceId || !tenantId) {
      return Response.json({ 
        error: 'Missing required fields: invoiceId, tenantId' 
      }, { status: 400 });
    }

    // Fetch invoice
    const invoice = await base44.asServiceRole.entities.Invoice.get(invoiceId);
    
    if (!invoice || invoice.tenant_id !== tenantId) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Fetch client info
    const client = await base44.asServiceRole.entities.Client.get(invoice.client_id);

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text('FATURA', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Invoice Number and Dates
    doc.setFontSize(11);
    doc.text(`Nº: ${invoice.invoice_number}`, 20, yPos);
    yPos += 6;
    doc.text(`Emissão: ${new Date(invoice.issue_date).toLocaleDateString('pt-BR')}`, 20, yPos);
    yPos += 6;
    doc.text(`Vencimento: ${new Date(invoice.due_date).toLocaleDateString('pt-BR')}`, 20, yPos);
    yPos += 10;

    // Client Info
    doc.setFontSize(10);
    doc.text('CLIENTE:', 20, yPos);
    yPos += 5;
    if (client) {
      doc.text(`${client.company_name}`, 20, yPos);
      yPos += 4;
      if (client.cnpj) {
        doc.text(`CNPJ: ${client.cnpj}`, 20, yPos);
        yPos += 4;
      }
      if (client.cpf) {
        doc.text(`CPF: ${client.cpf}`, 20, yPos);
        yPos += 4;
      }
      if (client.email) {
        doc.text(`Email: ${client.email}`, 20, yPos);
        yPos += 4;
      }
      if (client.phone) {
        doc.text(`Telefone: ${client.phone}`, 20, yPos);
        yPos += 4;
      }
    }
    
    yPos += 5;

    // Items Table Header
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    const tableTop = yPos;
    const colWidth = (pageWidth - 40) / 4;
    
    doc.text('DESCRIÇÃO', 20, yPos);
    doc.text('QTD', 20 + colWidth, yPos, { align: 'right' });
    doc.text('PREÇO', 20 + colWidth * 2, yPos, { align: 'right' });
    doc.text('TOTAL', 20 + colWidth * 3, yPos, { align: 'right' });
    
    yPos += 8;
    doc.setFont(undefined, 'normal');

    // Items
    let subtotal = 0;
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        const itemTotal = item.quantity * item.unit_price;
        subtotal += itemTotal;

        doc.text(item.description, 20, yPos);
        doc.text(item.quantity.toString(), 20 + colWidth, yPos, { align: 'right' });
        doc.text(`${item.unit_price.toFixed(2)}`, 20 + colWidth * 2, yPos, { align: 'right' });
        doc.text(`${itemTotal.toFixed(2)}`, 20 + colWidth * 3, yPos, { align: 'right' });
        
        yPos += 5;
      });
    }

    yPos += 5;

    // Totals
    doc.setFont(undefined, 'bold');
    doc.text(`Subtotal:`, 20 + colWidth * 2, yPos, { align: 'right' });
    doc.text(`${subtotal.toFixed(2)}`, 20 + colWidth * 3, yPos, { align: 'right' });
    yPos += 5;

    if (invoice.tax_amount > 0) {
      doc.text(`Impostos:`, 20 + colWidth * 2, yPos, { align: 'right' });
      doc.text(`${invoice.tax_amount.toFixed(2)}`, 20 + colWidth * 3, yPos, { align: 'right' });
      yPos += 5;
    }

    doc.setFontSize(12);
    doc.text(`TOTAL:`, 20 + colWidth * 2, yPos, { align: 'right' });
    doc.text(`${invoice.total_amount.toFixed(2)} ${invoice.currency}`, 20 + colWidth * 3, yPos, { align: 'right' });

    if (invoice.notes) {
      yPos += 15;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text('NOTAS:', 20, yPos);
      yPos += 5;
      doc.text(invoice.notes, 20, yPos, { maxWidth: pageWidth - 40 });
    }

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fatura-${invoice.invoice_number}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});