import React, { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

export default function MetricsExporter({ invoices, payments, clients, tenantId }) {
  const exportJSON = useCallback(() => {
    const data = {
      tenantId,
      exportDate: new Date().toISOString(),
      metrics: {
        totalRevenue: invoices.reduce((sum, i) => sum + i.total_amount, 0),
        totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
        clientCount: clients.length,
        invoiceCount: invoices.length,
        paymentCount: payments.length
      },
      invoices,
      payments
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricas-${tenantId}-${new Date().getTime()}.json`;
    a.click();
  }, [invoices, payments, clients, tenantId]);

  const exportPDF = useCallback(() => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    // Header
    doc.setFontSize(18);
    doc.text('Relatório de Métricas', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 10, yPosition);
    yPosition += 8;

    // Resumo
    const totalRevenue = invoices.reduce((sum, i) => sum + i.total_amount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    doc.setFontSize(12);
    doc.text('Resumo Executivo', 10, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const summaryData = [
      [`Receita Total: R$ ${totalRevenue.toLocaleString('pt-BR')}`],
      [`Valor Recebido: R$ ${totalPaid.toLocaleString('pt-BR')}`],
      [`Pendência: R$ ${(totalRevenue - totalPaid).toLocaleString('pt-BR')}`],
      [`Total de Clientes: ${clients.length}`]
    ];

    summaryData.forEach(row => {
      doc.text(row[0], 10, yPosition);
      yPosition += 6;
    });

    doc.save(`metricas-${tenantId}-${new Date().getTime()}.pdf`);
  }, [invoices, payments, clients, tenantId]);

  return (
    <div className="flex gap-3">
      <Button onClick={exportJSON} variant="outline" size="sm">
        <FileJson className="w-4 h-4 mr-2" />
        JSON
      </Button>
      <Button onClick={exportPDF} variant="outline" size="sm">
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}