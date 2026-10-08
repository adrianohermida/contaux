import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TicketAnalyticsChart({ tickets }) {
  const chartData = useMemo(() => {
    const statuses = {
      open: { count: 0, color: '#f59e0b' },
      in_progress: { count: 0, color: '#3b82f6' },
      waiting_client: { count: 0, color: '#60a5fa' },
      resolved: { count: 0, color: '#10b981' },
      closed: { count: 0, color: '#cbd5e1' }
    };

    tickets.forEach(t => {
      if (statuses[t.status]) statuses[t.status].count++;
    });

    return Object.entries(statuses)
      .filter(([_, v]) => v.count > 0)
      .map(([status, { count }]) => ({
        status: status.replace(/_/g, ' ').toUpperCase(),
        tickets: count
      }));
  }, [tickets]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="tickets" fill="#3b82f6" name="Quantidade" />
      </BarChart>
    </ResponsiveContainer>
  );
}