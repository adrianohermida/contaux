import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Sync Dashboard - Dashboard de sincronização em tempo real
 */
export default function SyncDashboard() {
  const [syncData, setSyncData] = useState([
    { time: '00:00', synced: 0, failed: 0, latency: 50 },
    { time: '04:00', synced: 150, failed: 2, latency: 65 },
    { time: '08:00', synced: 420, failed: 8, latency: 78 },
    { time: '12:00', synced: 890, failed: 12, latency: 95 },
    { time: '16:00', synced: 1200, failed: 15, latency: 110 },
    { time: '20:00', synced: 1680, failed: 20, latency: 125 },
    { time: '24:00', synced: 2100, failed: 28, latency: 145 },
  ]);

  const lastSync = syncData[syncData.length - 1];
  const successRate = Math.round(
    ((lastSync.synced / (lastSync.synced + lastSync.failed)) * 100) || 0
  );

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 md:p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Sincronizados</p>
          <p className="text-xl md:text-2xl font-bold text-blue-900">{lastSync.synced}</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <p className="text-xs text-amber-600 font-semibold">Falhas</p>
          <p className="text-xl md:text-2xl font-bold text-amber-900">{lastSync.failed}</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <p className="text-xs text-emerald-600 font-semibold">Taxa Sucesso</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-900">{successRate}%</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Latência</p>
          <p className="text-xl md:text-2xl font-bold text-blue-900">{lastSync.latency}ms</p>
        </Card>
      </div>

      <Card className="p-3 md:p-4 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-blue-700" />
          <h3 className="font-semibold text-sm md:text-base text-blue-900">Performance ao Longo do Tempo</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={syncData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '8px' }} />
            <Legend />
            <Line
              type="monotone"
              dataKey="synced"
              stroke="#1e40af"
              name="Sincronizados"
              strokeWidth={2}
              dot={{ fill: '#1e40af' }}
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke="#fbbf24"
              name="Falhas"
              strokeWidth={2}
              dot={{ fill: '#fbbf24' }}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#3b82f6"
              name="Latência (ms)"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}