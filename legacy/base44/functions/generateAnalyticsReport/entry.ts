import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import jsPDF from 'npm:jspdf@4.0.0';

/**
 * Gera relatório analítico em PDF
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const body = await req.json();
    const { tenantId, reportType = 'full' } = body;

    if (!user || user.tenant_id !== tenantId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Busca dados
    const [invoices, payments, tickets, clients, processes] = await Promise.all([
      base44.entities.Invoice.filter({ tenant_id: tenantId }),
      base44.entities.Payment.filter({ tenant_id: tenantId }),
      base44.entities.Ticket.filter({ tenant_id: tenantId }),
      base44.entities.Client.filter({ tenant_id: tenantId }),
      base44.entities.LegalProcess.filter({ tenant_id: tenantId })
    ]);

    // Cria PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Relatório Analítico', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`Período: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 15;

    // Sumário Financeiro
    doc.setFontSize(12);
    doc.text('RESUMO FINANCEIRO', margin, yPosition);
    yPosition += 8;

    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const overdue = invoices.filter(i => i.status === 'overdue' || (new Date(i.due_date) < new Date() && i.status !== 'paid')).reduce((sum, i) => sum + (i.total_amount || 0), 0);

    doc.setFontSize(10);
    doc.text(`Total Faturado: R$ ${totalInvoiced.toFixed(2)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Recebido: R$ ${totalPaid.toFixed(2)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Vencido: R$ ${overdue.toFixed(2)}`, margin, yPosition);
    yPosition += 12;

    // Operacional
    doc.setFontSize(12);
    doc.text('RESUMO OPERACIONAL', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.text(`Clientes Ativos: ${clients.filter(c => c.status === 'active').length}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Tickets Abertos: ${tickets.filter(t => t.status === 'open').length}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Processos em Andamento: ${processes.filter(p => p.status === 'in_progress').length}`, margin, yPosition);
    yPosition += 12;

    // Faturas pendentes
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.text('FATURAS PENDENTES', margin, yPosition);
    yPosition += 8;

    const pendingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'draft').slice(0, 10);
    doc.setFontSize(9);
    pendingInvoices.forEach(inv => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`#${inv.invoice_number} - R$ ${inv.total_amount.toFixed(2)} - Vence: ${new Date(inv.due_date).toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 5;
    });

    const pdfBuffer = doc.output('arraybuffer');

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio_${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});