import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ invoices }) {
  const chartData = useMemo(() => {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();

    invoices.forEach(inv => {
      if (!inv.issue_date || inv.status === 'draft') return;
      const date = new Date(inv.issue_date);
      if (date.getFullYear() !== currentYear) return;

      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + (inv.total_amount || 0);
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => {
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        return months.indexOf(a.month.toLowerCase()) - months.indexOf(b.month.toLowerCase());
      });
  }, [invoices]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Receita (R$)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}