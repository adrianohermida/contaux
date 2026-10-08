import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancialAnalyticsPanel({ clientId, tenantId }) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadData();
  }, [clientId, tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, payData] = await Promise.all([
        base44.entities.Invoice.filter({
          tenant_id: tenantId,
          client_id: clientId
        }),
        base44.entities.Payment.filter({
          tenant_id: tenantId,
          client_id: clientId
        })
      ]);
      setInvoices(invData || []);
      setPayments(payData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const totalPending = invoices.reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)), 0);
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      collectionRate,
      invoiceCount: invoices.length,
      paymentCount: payments.length,
      averageInvoice: invoices.length > 0 ? totalInvoiced / invoices.length : 0,
      overdue: invoices.filter(inv => new Date(inv.due_date) < new Date() && inv.status !== 'paid').length
    };
  };

  const getMonthlyData = () => {
    const monthlyMap = {};
    const last12Months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = { issued: 0, paid: 0, month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) };
      last12Months.push(key);
    }

    invoices.forEach(inv => {
      const invDate = new Date(inv.issue_date);
      const key = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        monthlyMap[key].issued += inv.total_amount || 0;
      }
    });

    payments.forEach(pay => {
      const payDate = new Date(pay.payment_date);
      const key = `${payDate.getFullYear()}-${String(payDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        monthlyMap[key].paid += pay.amount || 0;
      }
    });

    return last12Months.map(key => monthlyMap[key]);
  };

  const getStatusDistribution = () => {
    const distribution = {
      draft: { count: 0, value: 0, color: '#6b7280' },
      sent: { count: 0, value: 0, color: '#3b82f6' },
      paid: { count: 0, value: 0, color: '#10b981' },
      overdue: { count: 0, value: 0, color: '#ef4444' },
      cancelled: { count: 0, value: 0, color: '#9ca3af' }
    };

    invoices.forEach(inv => {
      const status = inv.status || 'draft';
      if (distribution[status]) {
        distribution[status].count += 1;
        distribution[status].value += inv.total_amount || 0;
      }
    });

    return Object.entries(distribution).map(([status, data]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: data.count,
      amount: data.value,
      color: data.color
    })).filter(item => item.value > 0);
  };

  const getPaymentMethodDistribution = () => {
    const methodMap = {
      bank_transfer: 0,
      credit_card: 0,
      debit_card: 0,
      pix: 0,
      check: 0,
      cash: 0,
      other: 0
    };

    payments.forEach(pay => {
      const method = pay.payment_method || 'other';
      if (methodMap[method] !== undefined) {
        methodMap[method] += pay.amount || 0;
      }
    });

    const methods = {
      bank_transfer: '🏦 Transferência',
      credit_card: '💳 Crédito',
      debit_card: '💳 Débito',
      pix: '📱 PIX',
      check: '📋 Cheque',
      cash: '💵 Dinheiro',
      other: 'Outro'
    };

    return Object.entries(methodMap)
      .filter(([_, value]) => value > 0)
      .map(([method, value]) => ({
        name: methods[method],
        value: value,
        fill: COLORS[Object.keys(methodMap).indexOf(method) % COLORS.length]
      }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando análises...</span>
      </div>
    );
  }

  const metrics = calculateMetrics();
  const monthlyData = getMonthlyData();
  const statusData = getStatusDistribution();
  const methodData = getPaymentMethodDistribution();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-slate-600 mb-1">Total Faturado</p>
          <p className="text-2xl font-bold text-blue-600">
            R$ {metrics.totalInvoiced.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-2">{metrics.invoiceCount} faturas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-slate-600 mb-1">Total Recebido</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {metrics.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-2">{metrics.paymentCount} pagamentos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <p className="text-sm text-slate-600 mb-1">Pendente</p>
          <p className="text-2xl font-bold text-orange-600">
            R$ {metrics.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-2">{metrics.overdue} vencidas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-slate-600 mb-1">Taxa de Recebimento</p>
          <p className="text-2xl font-bold text-purple-600">
            {metrics.collectionRate.toFixed(1)}%
          </p>
          <div className="flex items-center mt-2 text-xs">
            {metrics.collectionRate >= 80 ? (
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
            )}
            <span className="text-slate-500">Performance</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Tendência Mensal (12 Meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" style={{ fontSize: '0.75rem' }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line type="monotone" dataKey="issued" stroke="#3b82f6" name="Faturado" />
              <Line type="monotone" dataKey="paid" stroke="#10b981" name="Recebido" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        {statusData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Distribuição por Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      {methodData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Métodos de Pagamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={methodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Bar dataKey="value" fill="#3b82f6">
                {methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Resumo de Métricas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-slate-600">Ticket Médio</p>
            <p className="text-lg font-semibold">
              R$ {metrics.averageInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-slate-600">Total de Faturas</p>
            <p className="text-lg font-semibold">{metrics.invoiceCount}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-slate-600">Total de Pagtos</p>
            <p className="text-lg font-semibold">{metrics.paymentCount}</p>
          </div>
          <div className="p-3 bg-red-50 rounded">
            <p className="text-slate-600">Contas Vencidas</p>
            <p className="text-lg font-semibold text-red-600">{metrics.overdue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}