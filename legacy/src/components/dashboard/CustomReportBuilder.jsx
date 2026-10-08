import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, X, Eye, Save, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CustomReportBuilder({ clientId, tenantId }) {
  const [reportConfig, setReportConfig] = useState({
    name: 'Novo Relatório',
    entityType: 'Invoice',
    fields: [],
    filters: [],
    groupBy: null,
    sortBy: [],
    limit: 100
  });

  const [showPreview, setShowPreview] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Campos disponíveis por entity
  const ENTITY_FIELDS = {
    Invoice: [
      { value: 'invoice_number', label: 'Número' },
      { value: 'status', label: 'Status' },
      { value: 'issue_date', label: 'Data Emissão' },
      { value: 'due_date', label: 'Data Vencimento' },
      { value: 'total_amount', label: 'Valor Total' },
      { value: 'paid_amount', label: 'Valor Pago' },
      { value: 'currency', label: 'Moeda' }
    ],
    Payment: [
      { value: 'payment_date', label: 'Data Pagamento' },
      { value: 'amount', label: 'Valor' },
      { value: 'method', label: 'Método' },
      { value: 'status', label: 'Status' },
      { value: 'reference', label: 'Referência' }
    ],
    Client: [
      { value: 'company_name', label: 'Empresa' },
      { value: 'client_type', label: 'Tipo' },
      { value: 'cnpj', label: 'CNPJ' },
      { value: 'email', label: 'Email' },
      { value: 'status', label: 'Status' }
    ]
  };

  // Query: Carregar dados baseado na configuração
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['report-data', clientId, tenantId, reportConfig],
    queryFn: async () => {
      if (!clientId || !tenantId || !reportConfig.entityType) return null;

      let entity = base44.entities[reportConfig.entityType];
      if (!entity) return null;

      const data = await entity.filter({
        client_id: clientId,
        tenant_id: tenantId
      });

      // Aplicar filtros
      let filtered = [...data];
      reportConfig.filters.forEach(filter => {
        filtered = filtered.filter(item => {
          if (filter.operator === 'equals') return item[filter.field] === filter.value;
          if (filter.operator === 'contains') return String(item[filter.field]).includes(filter.value);
          if (filter.operator === 'gte') return item[filter.field] >= filter.value;
          if (filter.operator === 'lte') return item[filter.field] <= filter.value;
          return true;
        });
      });

      // Agrupar se necessário
      if (reportConfig.groupBy) {
        const grouped = {};
        filtered.forEach(item => {
          const key = item[reportConfig.groupBy];
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });
        return Object.entries(grouped).map(([key, items]) => ({
          [reportConfig.groupBy]: key,
          count: items.length,
          items
        }));
      }

      // Aplicar limite
      return filtered.slice(0, reportConfig.limit);
    },
    enabled: !!clientId && !!tenantId && reportConfig.entityType,
    staleTime: 5 * 60 * 1000
  });

  // Processar dados para visualização
  const processedData = useMemo(() => {
    if (!reportData) return null;

    return reportData.map(item => {
      const processed = {};
      reportConfig.fields.forEach(field => {
        processed[field] = item[field];
      });
      return processed;
    });
  }, [reportData, reportConfig.fields]);

  const handleAddField = (field) => {
    if (!reportConfig.fields.includes(field)) {
      setReportConfig({
        ...reportConfig,
        fields: [...reportConfig.fields, field]
      });
    }
  };

  const handleRemoveField = (field) => {
    setReportConfig({
      ...reportConfig,
      fields: reportConfig.fields.filter(f => f !== field)
    });
  };

  const handleAddFilter = () => {
    setReportConfig({
      ...reportConfig,
      filters: [...reportConfig.filters, { field: '', operator: 'equals', value: '' }]
    });
  };

  const handleUpdateFilter = (index, updates) => {
    const newFilters = [...reportConfig.filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setReportConfig({ ...reportConfig, filters: newFilters });
  };

  const handleRemoveFilter = (index) => {
    setReportConfig({
      ...reportConfig,
      filters: reportConfig.filters.filter((_, i) => i !== index)
    });
  };

  const handleSaveReport = async () => {
    try {
      const report = {
        ...reportConfig,
        clientId,
        tenantId,
        createdAt: new Date().toISOString()
      };

      const newSaved = [...savedReports, { id: Date.now().toString(), ...report }];
      setSavedReports(newSaved);
      localStorage.setItem(`reports_${tenantId}`, JSON.stringify(newSaved));

      toast.success('Relatório salvo com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar relatório');
    }
  };

  const handleExportReport = async () => {
    if (!processedData || processedData.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      // Converter para CSV
      const headers = Object.keys(processedData[0]);
      let csv = headers.join(',') + '\n';
      
      processedData.forEach(row => {
        csv += headers.map(h => {
          const val = row[h];
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportConfig.name}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success('Relatório exportado');
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  const fields = ENTITY_FIELDS[reportConfig.entityType] || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Construtor de Relatórios</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Configuração */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entity Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">Tipo de Entidade</label>
            <select
              value={reportConfig.entityType}
              onChange={(e) => setReportConfig({ ...reportConfig, entityType: e.target.value, fields: [] })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            >
              {Object.keys(ENTITY_FIELDS).map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>

          {/* Field Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Campos Selecionados</label>
              <span className="text-xs text-slate-600 dark:text-slate-400">{reportConfig.fields.length} selecionados</span>
            </div>

            {reportConfig.fields.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {reportConfig.fields.map(field => (
                  <div key={field} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                    <span>{fields.find(f => f.value === field)?.label || field}</span>
                    <button
                      onClick={() => handleRemoveField(field)}
                      className="hover:text-blue-900 dark:hover:text-blue-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {fields.map(field => (
                <button
                  key={field.value}
                  onClick={() => handleAddField(field.value)}
                  disabled={reportConfig.fields.includes(field.value)}
                  className="text-left px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  + {field.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Filtros</label>
              <Button onClick={handleAddFilter} size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {reportConfig.filters.map((filter, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    value={filter.field}
                    onChange={(e) => handleUpdateFilter(idx, { field: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white text-sm"
                  >
                    <option value="">Selecionar campo</option>
                    {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>

                  <select
                    value={filter.operator}
                    onChange={(e) => handleUpdateFilter(idx, { operator: e.target.value })}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white text-sm"
                  >
                    <option value="equals">Igual</option>
                    <option value="contains">Contém</option>
                    <option value="gte">≥</option>
                    <option value="lte">≤</option>
                  </select>

                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => handleUpdateFilter(idx, { value: e.target.value })}
                    placeholder="Valor"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white text-sm"
                  />

                  <button
                    onClick={() => handleRemoveFilter(idx)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel de Ações */}
        <div className="space-y-4">
          <Button onClick={() => setShowPreview(true)} className="w-full gap-2">
            <Eye className="w-4 h-4" /> Visualizar
          </Button>

          <Button onClick={handleSaveReport} variant="outline" className="w-full gap-2">
            <Save className="w-4 h-4" /> Salvar Relatório
          </Button>

          <Button onClick={handleExportReport} disabled={!processedData} variant="outline" className="w-full gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>

          {/* Relatórios Salvos */}
          {savedReports.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">Salvos</h3>
              <div className="space-y-2">
                {savedReports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      setReportConfig(report);
                    }}
                    className="w-full text-left px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    {report.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-96 overflow-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Visualização</h3>
              <button onClick={() => setShowPreview(false)} className="text-slate-600 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : processedData && processedData.length > 0 ? (
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(processedData[0]).map(header => (
                        <th key={header} className="text-left px-4 py-2 font-semibold text-slate-900 dark:text-slate-100">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-700">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-4 py-2 text-slate-700 dark:text-slate-300">
                            {String(val).substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-600 dark:text-slate-400">
                Nenhum dado para visualizar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}