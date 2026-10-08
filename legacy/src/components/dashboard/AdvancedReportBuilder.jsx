import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Filter, Calendar } from 'lucide-react';
import ReportFiltersPanel from './report/ReportFiltersPanel';
import ReportTable from './report/ReportTable';
import { toast } from 'sonner';

export default function AdvancedReportBuilder({ tenantId }) {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDataTypes, setSelectedDataTypes] = useState(['invoices']);
  const [filters, setFilters] = useState({ status: null, category: null, valueRange: [0, 10000] });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('table');

  const dataTypes = [
    { id: 'clients', label: 'Clientes', icon: '👥' },
    { id: 'invoices', label: 'Faturas', icon: '📋' },
    { id: 'transactions', label: 'Transações', icon: '💰' },
    { id: 'processes', label: 'Processos', icon: '⚖️' },
    { id: 'payments', label: 'Pagamentos', icon: '✓' }
  ];

  const generateReport = async () => {
    if (!selectedDataTypes.length) {
      toast.error('Selecione pelo menos um tipo de dados');
      return;
    }

    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const promises = selectedDataTypes.map(type => {
        switch (type) {
          case 'invoices':
            return base44.entities.Invoice.filter({ tenant_id: tenantId });
          case 'payments':
            return base44.entities.Payment.filter({ tenant_id: tenantId });
          case 'clients':
            return base44.entities.Client.filter({ tenant_id: tenantId });
          case 'transactions':
            return base44.entities.Transaction.filter({ tenant_id: tenantId });
          case 'processes':
            return base44.entities.LegalProcess.filter({ tenant_id: tenantId });
          default:
            return [];
        }
      });

      const results = await Promise.all(promises);
      const data = {};

      selectedDataTypes.forEach((type, idx) => {
        let filtered = results[idx] || [];

        // Filtro por data
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.created_date || item.issue_date || item.transaction_date);
          return itemDate >= start && itemDate <= end;
        });

        // Filtro por status
        if (filters.status) {
          filtered = filtered.filter(item => item.status === filters.status);
        }

        // Filtro por valor
        if (filters.valueRange) {
          filtered = filtered.filter(item => {
            const value = item.total_amount || item.amount || 0;
            return value >= filters.valueRange[0] && value <= filters.valueRange[1];
          });
        }

        data[type] = filtered;
      });

      setReportData(data);
      toast.success('Relatório gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!reportData || !selectedDataTypes.includes('invoices')) return [];
    
    const invoices = reportData.invoices || [];
    const groupedByMonth = {};

    invoices.forEach(invoice => {
      const date = new Date(invoice.issue_date || invoice.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = { month: monthKey, total: 0, paid: 0, count: 0 };
      }
      
      groupedByMonth[monthKey].total += invoice.total_amount || 0;
      if (invoice.status === 'paid') {
        groupedByMonth[monthKey].paid += invoice.total_amount || 0;
      }
      groupedByMonth[monthKey].count += 1;
    });

    return Object.values(groupedByMonth).sort((a, b) => a.month.localeCompare(b.month));
  }, [reportData, selectedDataTypes]);

  const summaryStats = useMemo(() => {
    if (!reportData) return null;

    return {
      totalInvoices: reportData.invoices?.length || 0,
      totalValue: (reportData.invoices || []).reduce((sum, i) => sum + (i.total_amount || 0), 0),
      totalPayments: reportData.payments?.length || 0,
      totalClients: reportData.clients?.length || 0,
      totalTransactions: reportData.transactions?.length || 0,
      avgValue: reportData.invoices?.length ? (reportData.invoices || []).reduce((sum, i) => sum + (i.total_amount || 0), 0) / reportData.invoices.length : 0
    };
  }, [reportData]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Filter className="w-5 h-5" />
            Configurar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Tipos de Dados</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {dataTypes.map(dt => (
                <button
                  key={dt.id}
                  onClick={() => {
                    setSelectedDataTypes(prev =>
                      prev.includes(dt.id)
                        ? prev.filter(x => x !== dt.id)
                        : [...prev, dt.id]
                    );
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    selectedDataTypes.includes(dt.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{dt.icon}</div>
                  <div className="text-xs font-medium">{dt.label}</div>
                </button>
              ))}
            </div>
          </div>

          <ReportFiltersPanel filters={filters} setFilters={setFilters} />

          <Button 
            onClick={generateReport} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {reportData && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Faturas</p>
                  <p className="text-3xl font-bold">{summaryStats?.totalInvoices}</p>
                  <p className="text-sm text-green-600">R$ {(summaryStats?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Clientes</p>
                  <p className="text-3xl font-bold">{summaryStats?.totalClients}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Valor Médio</p>
                  <p className="text-3xl font-bold">R$ {(summaryStats?.avgValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualização */}
          <Card>
            <CardHeader>
              <CardTitle>Visualização de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="table">Tabela</TabsTrigger>
                  <TabsTrigger value="barChart">Gráfico Barras</TabsTrigger>
                  <TabsTrigger value="lineChart">Gráfico Linhas</TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="mt-4">
                  <ReportTable reportData={reportData} selectedTypes={selectedDataTypes} />
                </TabsContent>

                <TabsContent value="barChart" className="mt-4">
                  {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#3b82f6" name="Total" />
                        <Bar dataKey="paid" fill="#10b981" name="Pago" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </TabsContent>

                <TabsContent value="lineChart" className="mt-4">
                  {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
                        <Line type="monotone" dataKey="paid" stroke="#10b981" name="Pago" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Exportar */}
          <div className="flex gap-3">
            <ExportReportButton data={reportData} format="csv" />
            <ExportReportButton data={reportData} format="pdf" />
          </div>
        </>
      )}
    </div>
  );
}