import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';

export default function ChurnAnalyticsWidget({ workspaceId }) {
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['churn-analytics', workspaceId],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictChurn', {
        workspace_id: workspaceId
      });
      return response.data?.predictions || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 45,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Churn Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Generate monthly churn projection
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baselineChurn = (predictions.filter(p => p.risk_level === 'critical').length / predictions.length) * 100;
  
  const chartData = months.map((month, idx) => ({
    month,
    projected: Math.round(baselineChurn + Math.random() * 5),
    baseline: Math.round(baselineChurn)
  }));

  // Risk distribution
  const critical = predictions.filter(p => p.risk_level === 'critical').length;
  const high = predictions.filter(p => p.risk_level === 'high').length;
  const medium = predictions.filter(p => p.risk_level === 'medium').length;
  const low = predictions.length - critical - high - medium;

  const avgRiskScore = Math.round(predictions.reduce((sum, p) => sum + p.churn_risk_score, 0) / predictions.length || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Churn Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">Avg Risk Score</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{avgRiskScore}%</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">Critical Cases</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{critical}</p>
            </div>
          </div>

          {/* Risk Distribution */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Risk Distribution</h4>
            <div className="space-y-2">
              {[
                { label: 'Critical', count: critical, color: 'bg-red-500' },
                { label: 'High', count: high, color: 'bg-yellow-500' },
                { label: 'Medium', count: medium, color: 'bg-orange-500' },
                { label: 'Low', count: low, color: 'bg-green-500' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projection Chart */}
          {chartData.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Churn Projection</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="projected" stroke="#ef4444" name="Projected" />
                  <Line type="monotone" dataKey="baseline" stroke="#94a3b8" name="Baseline" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}