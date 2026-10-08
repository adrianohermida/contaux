import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ContactGrowthWidget({ workspaceId }) {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts-growth', workspaceId],
    queryFn: () => base44.entities.Client.filter({ tenant_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 30 * 60 * 1000,
  });

  const generateMonthlyData = () => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Initialize data for last 12 months
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      data.push({
        month: months[month],
        pf: 0,
        pj: 0,
        active: 0,
        inactive: 0,
        total: 0,
      });
    }
    
    // Count contacts by month
    contacts.forEach(contact => {
      const createdDate = new Date(contact.created_date);
      const createdMonth = createdDate.getMonth();
      const createdYear = createdDate.getFullYear();
      
      // Find matching month in our data
      for (let i = 0; i < data.length; i++) {
        const dataDate = new Date(currentYear, now.getMonth() - (11 - i), 1);
        if (dataDate.getMonth() === createdMonth && dataDate.getFullYear() === createdYear) {
          if (contact.client_type === 'pf') {
            data[i].pf += 1;
          } else {
            data[i].pj += 1;
          }
          
          if (contact.status === 'active') {
            data[i].active += 1;
          } else {
            data[i].inactive += 1;
          }
          
          break;
        }
      }
    });
    
    // Convert to cumulative
    let cumulativePf = 0, cumulativePj = 0, cumulativeActive = 0, cumulativeInactive = 0;
    return data.map(item => {
      cumulativePf += item.pf;
      cumulativePj += item.pj;
      cumulativeActive += item.active;
      cumulativeInactive += item.inactive;
      
      return {
        ...item,
        pf: cumulativePf,
        pj: cumulativePj,
        active: cumulativeActive,
        inactive: cumulativeInactive,
        total: cumulativePf + cumulativePj,
      };
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Crescimento de Contatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-slate-200 dark:bg-slate-700 rounded" />
        </CardContent>
      </Card>
    );
  }

  const data = generateMonthlyData();
  const totalGrowth = data.length > 1 ? data[data.length - 1].total - data[0].total : 0;
  const growthRate = data[0].total > 0 && data.length > 1
    ? Math.round((totalGrowth / data[0].total) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Crescimento de Contatos (12 meses)
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {data[data.length - 1]?.total || 0} contatos no total
              {growthRate > 0 && ` (+${growthRate}%)`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Line Chart - Total Growth */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
            Crescimento Total (PF + PJ)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                className="text-sm"
              />
              <YAxis stroke="#94a3b8" className="text-sm" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Total"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked Bar - PF vs PJ */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
            Breakdown: Pessoa Física vs Pessoa Jurídica
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                className="text-sm"
              />
              <YAxis stroke="#94a3b8" className="text-sm" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Legend />
              <Bar dataKey="pf" stackId="type" fill="#10b981" name="Pessoa Física" />
              <Bar dataKey="pj" stackId="type" fill="#f59e0b" name="Pessoa Jurídica" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked Bar - Active vs Inactive */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
            Breakdown: Ativos vs Inativos
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                className="text-sm"
              />
              <YAxis stroke="#94a3b8" className="text-sm" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Legend />
              <Bar dataKey="active" stackId="status" fill="#06b6d4" name="Ativos" />
              <Bar dataKey="inactive" stackId="status" fill="#ef4444" name="Inativos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Final</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {data[data.length - 1]?.total || 0}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Pessoa Jurídica</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">
              {data[data.length - 1]?.pj || 0}
            </p>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Pessoa Física</p>
            <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
              {data[data.length - 1]?.pf || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}