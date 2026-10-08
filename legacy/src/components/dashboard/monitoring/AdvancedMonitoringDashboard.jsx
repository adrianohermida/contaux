import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, AlertCircle, Zap } from 'lucide-react';

export default function AdvancedMonitoringDashboard({ workspaceId }) {
  const [timeRange, setTimeRange] = useState('1h');

  const { data: metrics = {} } = useQuery({
    queryKey: ['advanced-metrics', workspaceId, timeRange],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        const response = await base44.functions.invoke('getAdvancedMetrics', {
          workspaceId: workspaceId,
          timeRange: timeRange
        });
        return response.data || {};
      } catch (err) {
        console.error('Error loading metrics:', err);
        return {};
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 10000
  });

  const timeRanges = [
    { value: '1h', label: '1 Hora' },
    { value: '6h', label: '6 Horas' },
    { value: '24h', label: '24 Horas' },
    { value: '7d', label: '7 Dias' }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {timeRanges.map(range => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Throughput</p>
              <p className="text-2xl font-bold mt-1">{metrics.throughput?.current || 0}/s</p>
              <p className="text-xs text-green-600 mt-1">↑ {metrics.throughput?.change || 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Latência P95</p>
              <p className="text-2xl font-bold mt-1">{metrics.latencyP95 || 0}ms</p>
              <p className="text-xs text-red-600 mt-1">↑ {metrics.latencyChange || 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Taxa de Erro</p>
              <p className="text-2xl font-bold mt-1">{metrics.errorRate || 0}%</p>
              <p className="text-xs text-green-600 mt-1">↓ {metrics.errorChange || 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Alertas Ativos</p>
              <p className="text-2xl font-bold mt-1">{metrics.activeAlerts || 0}</p>
              <p className="text-xs text-slate-600 mt-1">{metrics.alertsTrend || 'Estável'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CPU & Memory Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU & Memória</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metrics.cpuMemoryData || []}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMemory)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latência da Rede</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.latencyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Request Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Requisições por Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics.endpointData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="endpoint" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Error Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Erros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <p className="text-sm text-slate-600">5xx Errors</p>
              <p className="text-2xl font-bold text-red-600">{metrics.errors?.server || 0}</p>
            </div>
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <p className="text-sm text-slate-600">4xx Errors</p>
              <p className="text-2xl font-bold text-amber-600">{metrics.errors?.client || 0}</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-slate-600">Timeouts</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.errors?.timeout || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}