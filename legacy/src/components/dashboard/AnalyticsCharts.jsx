import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsCharts({ invoices = [], payments = [] }) {
  // Dados mensais de receita
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, i, 1).toLocaleDateString('pt-BR', { month: 'short' });
    const monthNumber = i + 1;
    const invoiceAmount = invoices
      .filter(inv => new Date(inv.issue_date).getMonth() === i)
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const paymentAmount = payments
      .filter(pay => new Date(pay.payment_date).getMonth() === i)
      .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    return { month, receita: invoiceAmount, recebimento: paymentAmount };
  });

  // Distribuição por status
  const statusData = [
    { name: 'Pago', value: invoices.filter(i => i.status === 'paid').length, color: '#10b981' },
    { name: 'Pendente', value: invoices.filter(i => i.status === 'sent' || i.status === 'viewed').length, color: '#f59e0b' },
    { name: 'Atrasado', value: invoices.filter(i => i.status === 'overdue').length, color: '#ef4444' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Receita Mensal */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Receita vs Recebimento (12 meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            <Legend />
            <Line type="monotone" dataKey="receita" stroke="#3b82f6" strokeWidth={2} name="Receita" />
            <Line type="monotone" dataKey="recebimento" stroke="#10b981" strokeWidth={2} name="Recebimento" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status de Faturas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Status de Faturas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} dataKey="value">
              {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Comparativo Mensal */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="font-semibold text-slate-900 mb-4">Análise Comparativa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            <Legend />
            <Bar dataKey="receita" fill="#3b82f6" name="Receita" />
            <Bar dataKey="recebimento" fill="#10b981" name="Recebimento" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}