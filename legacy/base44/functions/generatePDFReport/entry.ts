import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data, title = 'Relatório Contaux' } = await req.json();

    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = doc.internal.pageSize.width - 2 * margin;

    // Cabeçalho
    doc.setFontSize(16);
    doc.text(title, margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, y);
    y += 15;

    // Funções auxiliares
    const checkPageBreak = (space = 10) => {
      if (y + space > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const addSectionTitle = (title) => {
      checkPageBreak(10);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(title, margin, y);
      y += 8;
      doc.setDrawColor(200);
      doc.line(margin, y, margin + maxWidth, y);
      y += 5;
    };

    // Faturas
    if (data.invoices && data.invoices.length > 0) {
      addSectionTitle('Faturas');
      
      const invoiceHeaders = ['Número', 'Valor', 'Data', 'Status'];
      const invoiceData = data.invoices.map(inv => [
        inv.invoice_number,
        `R$ ${(inv.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        new Date(inv.issue_date).toLocaleDateString('pt-BR'),
        inv.status
      ]);

      doc.setFontSize(9);
      let tableY = y;
      
      // Cabeçalho da tabela
      doc.setFillColor(240, 240, 240);
      const colWidths = [30, 35, 30, 30];
      let currentX = margin;
      invoiceHeaders.forEach((header, idx) => {
        doc.text(header, currentX, tableY);
        currentX += colWidths[idx];
      });
      
      tableY += 7;
      
      // Dados da tabela
      invoiceData.forEach(row => {
        checkPageBreak(8);
        currentX = margin;
        row.forEach((cell, idx) => {
          doc.text(String(cell), currentX, tableY);
          currentX += colWidths[idx];
        });
        tableY += 7;
      });

      y = tableY + 5;
    }

    // Pagamentos
    if (data.payments && data.payments.length > 0) {
      addSectionTitle('Pagamentos');
      
      const paymentHeaders = ['Valor', 'Data', 'Método', 'Status'];
      const paymentData = data.payments.map(pmt => [
        `R$ ${(pmt.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        new Date(pmt.created_date).toLocaleDateString('pt-BR'),
        pmt.payment_method || '-',
        pmt.status
      ]);

      doc.setFontSize(9);
      let tableY = y;
      
      const colWidths = [35, 35, 35, 30];
      let currentX = margin;
      paymentHeaders.forEach((header, idx) => {
        doc.text(header, currentX, tableY);
        currentX += colWidths[idx];
      });
      
      tableY += 7;
      
      paymentData.forEach(row => {
        checkPageBreak(8);
        currentX = margin;
        row.forEach((cell, idx) => {
          doc.text(String(cell), currentX, tableY);
          currentX += colWidths[idx];
        });
        tableY += 7;
      });

      y = tableY + 5;
    }

    // Clientes
    if (data.clients && data.clients.length > 0) {
      addSectionTitle('Clientes');
      
      const clientHeaders = ['Nome', 'Email', 'Tipo', 'Status'];
      const clientData = data.clients.map(cli => [
        cli.company_name.substring(0, 20),
        cli.email.substring(0, 25),
        cli.client_type === 'pf' ? 'PF' : 'PJ',
        cli.status
      ]);

      doc.setFontSize(9);
      let tableY = y;
      
      const colWidths = [30, 40, 20, 20];
      let currentX = margin;
      clientHeaders.forEach((header, idx) => {
        doc.text(header, currentX, tableY);
        currentX += colWidths[idx];
      });
      
      tableY += 7;
      
      clientData.forEach(row => {
        checkPageBreak(8);
        currentX = margin;
        row.forEach((cell, idx) => {
          doc.text(String(cell), currentX, tableY);
          currentX += colWidths[idx];
        });
        tableY += 7;
      });

      y = tableY + 5;
    }

    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Contaux - Plataforma de Gestão', margin, pageHeight - 10);

    // Gerar PDF
    const pdfBytes = doc.output('arraybuffer');
    
    // Upload para storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `relatorio-${timestamp}.pdf`;
    
    const uploadedFile = await base44.integrations.Core.UploadFile({
      file: new Blob([pdfBytes], { type: 'application/pdf' })
    });

    return new Response(JSON.stringify({ 
      success: true,
      file_url: uploadedFile.file_url 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao gerar relatório PDF',
      details: error.message 
    }), { status: 500 });
  }
});