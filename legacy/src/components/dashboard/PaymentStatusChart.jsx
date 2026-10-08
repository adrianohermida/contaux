import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  paid: '#10b981',
  overdue: '#f59e0b',
  sent: '#3b82f6',
  draft: '#cbd5e1'
};

export default function PaymentStatusChart({ invoices }) {
  const chartData = useMemo(() => {
    const counts = { paid: 0, overdue: 0, sent: 0, draft: 0 };
    const today = new Date();

    invoices.forEach(inv => {
      if (inv.status === 'paid') counts.paid++;
      else if (inv.status === 'draft') counts.draft++;
      else if (new Date(inv.due_date) < today && inv.status !== 'paid') counts.overdue++;
      else counts.sent++;
    });

    return Object.entries(counts)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [invoices]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} dataKey="value">
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase()] || '#3b82f6'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}