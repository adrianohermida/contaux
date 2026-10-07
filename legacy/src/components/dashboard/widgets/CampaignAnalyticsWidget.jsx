import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function CampaignAnalyticsWidget({ workspaceId }) {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaign-analytics', workspaceId],
    queryFn: async () => {
      const response = await base44.asServiceRole.entities.Campaign.filter({
        workspace_id: workspaceId,
        status: ['active', 'completed']
      });
      return response || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 10
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Campaign Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = campaigns.slice(0, 6).map(c => ({
    name: c.name.slice(0, 10),
    sent: c.sent_count || 0,
    open: c.open_count || 0,
    click: c.click_count || 0,
    conversion: c.conversion_count || 0
  }));

  const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const totalOpen = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0);
  const totalConversion = campaigns.reduce((sum, c) => sum + (c.conversion_count || 0), 0);

  const avgOpenRate = totalSent > 0 ? ((totalOpen / totalSent) * 100).toFixed(1) : 0;
  const avgConversionRate = totalSent > 0 ? ((totalConversion / totalSent) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Campaign Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">Avg Open Rate</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{avgOpenRate}%</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">Avg Conversion</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{avgConversionRate}%</p>
            </div>
          </div>

          {/* Campaign Performance Chart */}
          {chartData.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Campaign Performance</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                  <Bar dataKey="open" fill="#10b981" name="Opened" />
                  <Bar dataKey="conversion" fill="#f59e0b" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}