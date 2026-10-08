import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Cell } from 'recharts';
import { Activity, Users, TrendingUp, Clock } from 'lucide-react';

export default function UsageAnalytics({ workspaceId }) {
  const { data: usageData = {} } = useQuery({
    queryKey: ['usage-analytics', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        const response = await base44.functions.invoke('generateUsageMetrics', {
          workspaceId: workspaceId,
          period: '30days'
        });
        return response.data || {};
      } catch (err) {
        console.error('Error loading usage analytics:', err);
        return {};
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 300000
  });

  const metrics = [
    { label: 'Usuários Ativos', value: usageData.activeUsers || 0, icon: Users, color: 'blue' },
    { label: 'Requisições/hora', value: usageData.requestsPerHour || 0, icon: TrendingUp, color: 'green' },
    { label: 'Tempo Médio', value: `${usageData.avgResponseTime || 0}ms`, icon: Clock, color: 'purple' },
    { label: 'Taxa de Erro', value: `${usageData.errorRate || 0}%`, icon: Activity, color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const colors = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            purple: 'text-purple-600 bg-purple-100',
            red: 'text-red-600 bg-red-100'
          };

          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-2 rounded ${colors[metric.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Chart */}
      {usageData.dailyActivity && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade Diária (últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="requests" fill="#3b82f6" stroke="#1e40af" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Feature Usage */}
      {usageData.featureUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Uso de Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={usageData.featureUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#3b82f6">
                  {usageData.featureUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Pages */}
      {usageData.topPages && (
        <Card>
          <CardHeader>
            <CardTitle>Páginas Mais Usadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usageData.topPages.slice(0, 5).map((page, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">{page.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${(page.views / usageData.topPages[0].views) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 min-w-10">{page.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}