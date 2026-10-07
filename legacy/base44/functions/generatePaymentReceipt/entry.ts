/**
 * Generate Payment Receipt PDF
 * Backend function to generate receipt from payment
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

    const { paymentId, tenantId } = await req.json();

    if (!paymentId || !tenantId) {
      return Response.json({ 
        error: 'Missing required fields: paymentId, tenantId' 
      }, { status: 400 });
    }

    // Fetch payment
    const payment = await base44.asServiceRole.entities.Payment.get(paymentId);
    
    if (!payment || payment.tenant_id !== tenantId) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Fetch invoice
    const invoice = await base44.asServiceRole.entities.Invoice.get(payment.invoice_id);
    
    // Fetch client
    const client = await base44.asServiceRole.entities.Client.get(payment.client_id);

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text('COMPROVANTE DE PAGAMENTO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Recibo Number and Date
    doc.setFontSize(11);
    doc.text(`Nº: ${payment.payment_number}`, 20, yPos);
    yPos += 6;
    doc.text(`Data: ${new Date(payment.payment_date).toLocaleDateString('pt-BR')}`, 20, yPos);
    yPos += 10;

    // Payer Info
    doc.setFontSize(10);
    doc.text('PAGADOR:', 20, yPos);
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
    }

    yPos += 5;

    // Invoice Info
    doc.text('REFERÊNCIA:', 20, yPos);
    yPos += 5;
    if (invoice) {
      doc.text(`Fatura: ${invoice.invoice_number}`, 20, yPos);
      yPos += 4;
      doc.text(`Valor Total: ${invoice.total_amount.toFixed(2)} ${invoice.currency}`, 20, yPos);
      yPos += 4;
      doc.text(`Vencimento: ${new Date(invoice.due_date).toLocaleDateString('pt-BR')}`, 20, yPos);
      yPos += 4;
    }

    yPos += 5;

    // Payment Details
    doc.text('PAGAMENTO RECEBIDO:', 20, yPos);
    yPos += 5;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Valor: ${payment.amount.toFixed(2)} ${payment.currency}`, 20, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Método: ${payment.payment_method}`, 20, yPos);
    yPos += 4;
    doc.text(`Status: ${payment.status}`, 20, yPos);
    yPos += 4;
    
    if (payment.transaction_id) {
      doc.text(`ID Transação: ${payment.transaction_id}`, 20, yPos);
      yPos += 4;
    }

    yPos += 5;

    // Notes
    if (payment.notes) {
      doc.text('OBSERVAÇÕES:', 20, yPos);
      yPos += 4;
      doc.setFontSize(9);
      doc.text(payment.notes, 20, yPos, { maxWidth: pageWidth - 40 });
    }

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(8);
    doc.text('Comprovante de pagamento emitido automaticamente', 20, yPos);
    yPos += 4;
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 20, yPos);

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="comprovante-${payment.payment_number}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});