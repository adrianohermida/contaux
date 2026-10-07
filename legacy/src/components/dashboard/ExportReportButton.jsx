import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ExportReportButton({ data, format = 'csv' }) {
  const [loading, setLoading] = useState(false);

  const exportToCSV = () => {
    try {
      let csv = '';
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Cabeçalho
      csv += `Relatório Contaux - ${timestamp}\n\n`;

      // Faturas
      if (data.invoices?.length > 0) {
        csv += 'FATURAS\n';
        csv += 'Número,Cliente,Valor,Data,Status\n';
        data.invoices.forEach(inv => {
          csv += `${inv.invoice_number},"${inv.client_id}",${inv.total_amount},${new Date(inv.issue_date).toLocaleDateString('pt-BR')},${inv.status}\n`;
        });
        csv += '\n\n';
      }

      // Pagamentos
      if (data.payments?.length > 0) {
        csv += 'PAGAMENTOS\n';
        csv += 'Valor,Data,Método,Status\n';
        data.payments.forEach(pmt => {
          csv += `${pmt.amount},${new Date(pmt.created_date).toLocaleDateString('pt-BR')},${pmt.payment_method || '-'},${pmt.status}\n`;
        });
        csv += '\n\n';
      }

      // Clientes
      if (data.clients?.length > 0) {
        csv += 'CLIENTES\n';
        csv += 'Nome,Email,Tipo,Status\n';
        data.clients.forEach(cli => {
          csv += `"${cli.company_name}","${cli.email}",${cli.client_type},${cli.status}\n`;
        });
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-${timestamp}.csv`);
      link.click();
      
      toast.success('Relatório exportado em CSV');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
      console.error(error);
    }
  };

  const exportToPDF = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generatePDFReport', {
        data: data,
        title: `Relatório Contaux - ${new Date().toLocaleDateString('pt-BR')}`
      });

      if (response.data?.file_url) {
        const link = document.createElement('a');
        link.href = response.data.file_url;
        link.download = `relatorio-${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        toast.success('Relatório exportado em PDF');
      }
    } catch (error) {
      toast.error('Erro ao exportar PDF');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={format === 'csv' ? exportToCSV : exportToPDF}
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      {loading ? 'Processando...' : `Exportar ${format.toUpperCase()}`}
    </Button>
  );
}