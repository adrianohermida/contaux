import React, { memo, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportsCharts = memo(function ReportsCharts({ invoices = [], payments = [] }) {
  const monthlyRevenue = useMemo(() => 
    invoices.reduce((acc, inv) => {
      const month = new Date(inv.issue_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const existing = acc.find(m => m.month === month);
      if (existing) existing.valor += inv.total_amount;
      else acc.push({ month, valor: inv.total_amount });
      return acc;
    }, [])
  , [invoices]);

  const statusDistribution = useMemo(() => [
    { name: 'Pagas', value: invoices.filter(i => i.status === 'paid').length },
    { name: 'Pendentes', value: invoices.filter(i => i.status !== 'paid').length },
    { name: 'Canceladas', value: invoices.filter(i => i.status === 'cancelled').length }
  ], [invoices]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="valor" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Status de Faturas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default ReportsCharts;