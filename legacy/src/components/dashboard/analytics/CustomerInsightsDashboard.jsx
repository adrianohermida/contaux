import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, AlertCircle, Target } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CustomerInsightsDashboard({ workspaceId }) {
  const { data: clients = [] } = useQuery({
    queryKey: ['customer-insights', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const [clients, invoices, tickets] = await Promise.all([
        base44.entities.Client.filter({ tenant_id: workspaceId }),
        base44.entities.Invoice.filter({ tenant_id: workspaceId }),
        base44.entities.Ticket.filter({ tenant_id: workspaceId })
      ]);
      return { clients, invoices, tickets };
    },
    enabled: !!workspaceId
  });

  const insights = useMemo(() => {
    if (!clients.clients) return null;

    const data = clients;
    const activeClients = data.clients.filter(c => c.status === 'active');
    const inactiveClients = data.clients.filter(c => c.status !== 'active');
    
    // Purchase pattern analysis
    const clientPurchaseValue = {};
    data.invoices.forEach(inv => {
      if (!clientPurchaseValue[inv.contact_id]) {
        clientPurchaseValue[inv.contact_id] = 0;
      }
      clientPurchaseValue[inv.contact_id] += inv.total_amount || 0;
    });

    // Segmentation
    const highValue = activeClients.filter(c => (clientPurchaseValue[c.id] || 0) > 50000);
    const mediumValue = activeClients.filter(c => (clientPurchaseValue[c.id] || 0) > 10000 && (clientPurchaseValue[c.id] || 0) <= 50000);
    const lowValue = activeClients.filter(c => (clientPurchaseValue[c.id] || 0) <= 10000);

    // Churn risk (no activity in last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const churnRisk = activeClients.filter(client => {
      const lastInvoice = data.invoices
        .filter(i => i.contact_id === client.id)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
      
      return !lastInvoice || new Date(lastInvoice.created_date) < ninetyDaysAgo;
    });

    // Support engagement
    const clientTickets = {};
    data.tickets.forEach(ticket => {
      if (!clientTickets[ticket.contact_id]) {
        clientTickets[ticket.contact_id] = 0;
      }
      clientTickets[ticket.contact_id]++;
    });

    const highEngagement = activeClients.filter(c => (clientTickets[c.id] || 0) > 5);

    return {
      totalClients: data.clients.length,
      activeClients: activeClients.length,
      inactiveClients: inactiveClients.length,
      segmentation: [
        { name: 'Alto Valor', value: highValue.length, fill: '#3b82f6' },
        { name: 'Médio Valor', value: mediumValue.length, fill: '#10b981' },
        { name: 'Baixo Valor', value: lowValue.length, fill: '#f59e0b' }
      ],
      churnRisk: churnRisk.length,
      churnRiskRate: ((churnRisk.length / activeClients.length) * 100).toFixed(1),
      highEngagement: highEngagement.length,
      engagementRate: ((highEngagement.length / activeClients.length) * 100).toFixed(1)
    };
  }, [clients]);

  if (!insights) {
    return <div className="text-center py-8 text-slate-500">Carregando insights...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Clientes Ativos</p>
              <p className="text-2xl font-bold">{insights.activeClients}</p>
              <p className="text-xs text-slate-500 mt-1">{((insights.activeClients / insights.totalClients) * 100).toFixed(0)}% do total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Alto Engajamento</p>
              <p className="text-2xl font-bold">{insights.highEngagement}</p>
              <p className="text-xs text-slate-500 mt-1">{insights.engagementRate}% da base ativa</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Risco de Churn</p>
              <p className="text-2xl font-bold">{insights.churnRisk}</p>
              <p className="text-xs text-slate-500 mt-1">{insights.churnRiskRate}% da base ativa</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Total de Clientes</p>
              <p className="text-2xl font-bold">{insights.totalClients}</p>
              <p className="text-xs text-slate-500 mt-1">{insights.inactiveClients} inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segmentation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Segmentação de Clientes por Valor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={insights.segmentation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {insights.segmentation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Oportunidades de Crescimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Reativar Inativos</p>
              <p className="text-xs text-blue-700">{insights.inactiveClientes} clientes inativos com potencial</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-900">Reter Alto Valor</p>
              <p className="text-xs text-green-700">Foco em clientes de alto valor com risco de churn</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-900">Programas de Fidelização</p>
              <p className="text-xs text-purple-700">Implementar rewards para médio valor</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estratégias Recomendadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">Prevenir Churn</p>
              <p className="text-xs text-yellow-700">Contactar {insights.churnRisk} clientes em risco</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-900">Engajamento</p>
              <p className="text-xs text-red-700">Aumentar suporte para {insights.highEngagement - insights.churnRisk} clientes</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm font-medium text-indigo-900">Upsell/Cross-sell</p>
              <p className="text-xs text-indigo-700">Focar em clientes ativos com potencial</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}