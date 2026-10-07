import React, { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Cache Statistics - Estatísticas de cache
 */
export default function CacheStatistics() {
  const [timeSeriesData] = useState([
    { time: '00:00', hits: 100, misses: 20 },
    { time: '04:00', hits: 250, misses: 45 },
    { time: '08:00', hits: 580, misses: 85 },
    { time: '12:00', hits: 950, misses: 120 },
    { time: '16:00', hits: 1200, misses: 180 },
    { time: '20:00', hits: 1450, misses: 220 },
    { time: '24:00', hits: 1800, misses: 280 },
  ]);

  const [typeData] = useState([
    { name: 'Invoices', value: 35, color: '#1e40af' },
    { name: 'Payments', value: 25, color: '#3b82f6' },
    { name: 'Tickets', value: 20, color: '#60a5fa' },
    { name: 'Clients', value: 20, color: '#93c5fd' },
  ]);

  const totalHits = timeSeriesData.reduce((sum, d) => sum + d.hits, 0);
  const totalMisses = timeSeriesData.reduce((sum, d) => sum + d.misses, 0);
  const hitRate = Math.round((totalHits / (totalHits + totalMisses)) * 100);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 md:p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Total Hits</p>
          <p className="text-xl md:text-2xl font-bold text-blue-900">{totalHits}</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <p className="text-xs text-amber-600 font-semibold">Total Misses</p>
          <p className="text-xl md:text-2xl font-bold text-amber-900">{totalMisses}</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <p className="text-xs text-emerald-600 font-semibold">Hit Rate</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-900">{hitRate}%</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Avg Latency</p>
          <p className="text-xl md:text-2xl font-bold text-blue-900">8ms</p>
        </Card>
      </div>

      <Card className="p-3 md:p-4 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-blue-700" />
          <h3 className="font-semibold text-sm md:text-base text-blue-900">Performance ao Longo do Tempo</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="hits" fill="#1e40af" name="Hits" />
            <Bar dataKey="misses" fill="#fbbf24" name="Misses" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-3 md:p-4 border-blue-200">
        <h3 className="font-semibold text-sm md:text-base text-blue-900 mb-3">Distribuição por Tipo</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={70}
              fill="#1e40af"
              dataKey="value"
            >
              {typeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}