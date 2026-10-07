import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, Download, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const REPORT_TEMPLATES = [
  {
    id: 'financial-summary',
    name: 'Resumo Financeiro',
    description: 'Visão geral de receitas, despesas e lucro',
    metrics: ['total_revenue', 'total_expenses', 'profit_margin', 'payment_rate']
  },
  {
    id: 'invoice-aging',
    name: 'Análise de Vencimentos',
    description: 'Faturas por período de vencimento',
    metrics: ['overdue', 'due_soon', 'due_later']
  },
  {
    id: 'client-performance',
    name: 'Desempenho de Clientes',
    description: 'Ranking de clientes por receita gerada',
    metrics: ['top_clients', 'client_revenue', 'payment_rate']
  },
  {
    id: 'tax-compliance',
    name: 'Conformidade Fiscal',
    description: 'Resumo de impostos e obrigações (Brasil)',
    metrics: ['nfe_issued', 'tax_payable', 'compliance_status']
  },
  {
    id: 'cash-flow',
    name: 'Fluxo de Caixa',
    description: 'Movimentação de caixa diária/semanal/mensal',
    metrics: ['inflows', 'outflows', 'net_balance', 'forecast']
  },
  {
    id: 'custom',
    name: 'Relatório Personalizado',
    description: 'Crie um relatório com métricas customizadas',
    metrics: ['custom']
  }
];

export default function ReportBuilder({ tenantId }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [reportName, setReportName] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleGeneratePreview = async () => {
    setLoading(true);
    try {
      // Simulação - em produção chamaria função backend
      await new Promise(r => setTimeout(r, 1500));
      setPreview({
        template: selectedTemplate,
        name: reportName,
        period: dateRange,
        data: { generated: new Date().toISOString() }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const filename = `${reportName}-${new Date().toISOString().split('T')[0]}.${format}`;
      console.log(`Exportando: ${filename}`);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Construtor de Relatórios</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_TEMPLATES.map(template => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-slate-900">{template.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{template.description}</p>
              <div className="mt-3 flex items-center text-xs text-slate-500">
                <span>{template.metrics.length} métricas</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={() => setSelectedTemplate(null)}
        className="gap-2"
      >
        ← Voltar
      </Button>

      <div className="bg-white rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold">{template.name}</h3>
        <p className="text-sm text-slate-600">{template.description}</p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Nome do Relatório</label>
            <Input
              placeholder="Ex: Relatório Financeiro Jan/2026"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Data Início</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Data Fim</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePreview}
            disabled={!reportName || loading}
            className="flex-1 gap-2"
          >
            <Eye className="w-4 h-4" />
            {loading ? 'Gerando...' : 'Visualizar'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            disabled={!preview}
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      {preview && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold">Visualização do Relatório</h4>
          <p className="text-sm text-slate-600">
            {reportName} • {dateRange.start} a {dateRange.end}
          </p>

          <div className="bg-white rounded p-4 h-96 flex items-center justify-center text-slate-500">
            Gráficos e dados aparecerão aqui
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handleExport('pdf')} variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button onClick={() => handleExport('excel')} variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Excel
            </Button>
            <Button onClick={() => handleExport('csv')} variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}