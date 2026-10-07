import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, FileText, Sheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExportButtons({ data, type = 'invoices' }) {
  const [exporting, setExporting] = useState(null);

  const exportPDF = async () => {
    setExporting('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text(`Relatório de ${type === 'invoices' ? 'Faturas' : 'Pagamentos'}`, 20, 20);
      
      doc.setFontSize(10);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
      
      let yPos = 45;
      data.forEach((item, idx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const text = `${idx + 1}. ${item.invoice_number || item.payment_number} - R$ ${(item.total_amount || item.amount).toFixed(2)}`;
        doc.text(text, 20, yPos);
        yPos += 10;
      });

      doc.save(`relatorio-${type}-${Date.now()}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const exportCSV = () => {
    setExporting('csv');
    try {
      const headers = type === 'invoices' 
        ? ['Número', 'Cliente', 'Data', 'Valor', 'Status']
        : ['Número', 'Fatura', 'Data', 'Valor', 'Status'];
      
      const rows = data.map(item => 
        type === 'invoices'
          ? [item.invoice_number, item.client_id, item.issue_date, item.total_amount, item.status]
          : [item.payment_number, item.invoice_id, item.payment_date, item.amount, item.status]
      );

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={exportPDF} 
        disabled={exporting !== null}
        variant="outline"
        size="sm"
      >
        <FileText className="w-4 h-4 mr-2" />
        {exporting === 'pdf' ? 'Gerando...' : 'PDF'}
      </Button>
      <Button 
        onClick={exportCSV} 
        disabled={exporting !== null}
        variant="outline"
        size="sm"
      >
        <Sheet className="w-4 h-4 mr-2" />
        {exporting === 'csv' ? 'Gerando...' : 'CSV'}
      </Button>
    </div>
  );
}