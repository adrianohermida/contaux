import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, FileText, Calendar, Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ReportGenerationPanel({ clientId, tenantId }) {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('invoices');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState('pdf');

  const REPORT_TYPES = [
    { 
      value: 'invoices', 
      label: '📄 Relatório de Faturas',
      description: 'Detalhamento de faturas emitidas'
    },
    { 
      value: 'payments', 
      label: '💰 Relatório de Pagamentos',
      description: 'Histórico de pagamentos recebidos'
    },
    { 
      value: 'financial_summary', 
      label: '📊 Resumo Financeiro',
      description: 'Visão geral de receitas e despesas'
    },
    { 
      value: 'aging', 
      label: '⚠️ Relatório de Vencimentos',
      description: 'Análise de contas a receber por vencimento'
    }
  ];

  const getReportContent = async () => {
    try {
      const [invoices, payments] = await Promise.all([
        base44.entities.Invoice.filter({
          tenant_id: tenantId,
          client_id: clientId
        }),
        base44.entities.Payment.filter({
          tenant_id: tenantId,
          client_id: clientId
        })
      ]);

      const filteredInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issue_date);
        return invDate >= new Date(startDate) && invDate <= new Date(endDate);
      });

      const filteredPayments = payments.filter(pay => {
        const payDate = new Date(pay.payment_date);
        return payDate >= new Date(startDate) && payDate <= new Date(endDate);
      });

      return {
        invoices: filteredInvoices,
        payments: filteredPayments,
        period: {
          start: new Date(startDate).toLocaleDateString('pt-BR'),
          end: new Date(endDate).toLocaleDateString('pt-BR')
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  };

  const generateReportContent = (data) => {
    const { invoices, payments, period } = data;

    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const totalPending = invoices.reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)), 0);
    const overdue = invoices.filter(inv => new Date(inv.due_date) < new Date() && inv.status !== 'paid').length;

    let content = '';

    if (reportType === 'invoices') {
      content = `
RELATÓRIO DE FATURAS
Período: ${period.start} a ${period.end}
${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}

RESUMO:
- Total Faturado: R$ ${totalInvoiced.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Total Recebido: R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Pendente: R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Quantidade: ${invoices.length} faturas

FATURAS:
${invoices.map(inv => `
  Fatura: ${inv.invoice_number}
  Emissão: ${new Date(inv.issue_date).toLocaleDateString('pt-BR')}
  Vencimento: ${new Date(inv.due_date).toLocaleDateString('pt-BR')}
  Valor: R$ ${inv.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
  Pago: R$ ${(inv.paid_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
  Status: ${inv.status}
`).join('')}
      `;
    } else if (reportType === 'payments') {
      content = `
RELATÓRIO DE PAGAMENTOS
Período: ${period.start} a ${period.end}
${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}

RESUMO:
- Total Recebido: R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Quantidade: ${payments.length} pagamentos
- Média por Pagamento: R$ ${(totalPaid / (payments.length || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

PAGAMENTOS:
${payments.map(pay => `
  Data: ${new Date(pay.payment_date).toLocaleDateString('pt-BR')}
  Valor: R$ ${pay.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
  Método: ${pay.payment_method}
  Status: ${pay.status}
  Referência: ${pay.reference_number || 'N/A'}
`).join('')}
      `;
    } else if (reportType === 'financial_summary') {
      content = `
RESUMO FINANCEIRO
Período: ${period.start} a ${period.end}
${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}

INDICADORES:
✓ Total Faturado: R$ ${totalInvoiced.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
✓ Total Recebido: R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
✓ Total Pendente: R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
✓ Taxa de Recebimento: ${((totalPaid / totalInvoiced) * 100 || 0).toFixed(1)}%

ANÁLISE:
- Faturas Emitidas: ${invoices.length}
- Pagamentos Recebidos: ${payments.length}
- Contas Vencidas: ${overdue}
- Taxa de Inadimplência: ${(overdue / invoices.length * 100 || 0).toFixed(1)}%
      `;
    } else if (reportType === 'aging') {
      const today = new Date();
      const aging = {
        current: invoices.filter(inv => new Date(inv.due_date) >= today && inv.status !== 'paid'),
        overdue30: invoices.filter(inv => {
          const daysOverdue = Math.floor((today - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));
          return daysOverdue > 0 && daysOverdue <= 30 && inv.status !== 'paid';
        }),
        overdue60: invoices.filter(inv => {
          const daysOverdue = Math.floor((today - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));
          return daysOverdue > 30 && daysOverdue <= 60 && inv.status !== 'paid';
        }),
        overdue90: invoices.filter(inv => {
          const daysOverdue = Math.floor((today - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));
          return daysOverdue > 60 && inv.status !== 'paid';
        })
      };

      content = `
RELATÓRIO DE VENCIMENTOS (AGING)
Data: ${new Date().toLocaleDateString('pt-BR')}

RESUMO POR PERÍODO:
- A Vencer: R$ ${aging.current.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${aging.current.length} faturas)
- 1-30 dias vencido: R$ ${aging.overdue30.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${aging.overdue30.length} faturas)
- 31-60 dias vencido: R$ ${aging.overdue60.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${aging.overdue60.length} faturas)
- 61+ dias vencido: R$ ${aging.overdue90.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${aging.overdue90.length} faturas)

TOTAL A RECEBER: R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      `;
    }

    return content;
  };

  const handleDownload = async () => {
    try {
      setLoading(true);

      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Data inicial deve ser menor que data final');
        return;
      }

      const data = await getReportContent();
      const content = generateReportContent(data);

      if (format === 'txt') {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${reportType}_${new Date().getTime()}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Relatório exportado!');
      } else if (format === 'csv') {
        let csv = '';
        if (reportType === 'invoices') {
          csv = 'Fatura,Emissão,Vencimento,Valor Total,Valor Pago,Saldo,Status\n';
          csv += data.invoices.map(inv =>
            `${inv.invoice_number},${new Date(inv.issue_date).toLocaleDateString('pt-BR')},${new Date(inv.due_date).toLocaleDateString('pt-BR')},${inv.total_amount},${inv.paid_amount || 0},${inv.total_amount - (inv.paid_amount || 0)},${inv.status}`
          ).join('\n');
        } else if (reportType === 'payments') {
          csv = 'Data,Valor,Método,Status,Referência\n';
          csv += data.payments.map(pay =>
            `${new Date(pay.payment_date).toLocaleDateString('pt-BR')},${pay.amount},${pay.payment_method},${pay.status},${pay.reference_number || 'N/A'}`
          ).join('\n');
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${reportType}_${new Date().getTime()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exportado!');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => setReportType(type.value)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              reportType === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-semibold mb-1">{type.label}</p>
            <p className="text-sm text-gray-600">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Período
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Formato</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="pdf">📄 PDF</option>
              <option value="txt">📝 Texto</option>
              <option value="csv">📊 CSV</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" />
          <strong>Relatórios disponíveis:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Detalhamento completo de faturas no período</li>
          <li>Histórico de todos os pagamentos recebidos</li>
          <li>Análise financeira com indicadores de performance</li>
          <li>Aging report com análise de vencimentos</li>
        </ul>
      </div>
    </div>
  );
}