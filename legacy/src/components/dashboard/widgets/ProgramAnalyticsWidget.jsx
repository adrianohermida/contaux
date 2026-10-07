import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function ProgramAnalyticsWidget({ workspaceId }) {
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['loyalty-analytics', workspaceId],
    queryFn: async () => {
      const response = await base44.asServiceRole.entities.LoyaltyProgram.filter({
        workspace_id: workspaceId
      });
      return response || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 15
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Program Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const chartData = programs.map(p => ({
    name: p.name.slice(0, 10),
    issued: p.total_points_issued || 0,
    redeemed: p.total_points_redeemed || 0,
    members: p.member_count || 0
  }));

  const totalIssued = programs.reduce((sum, p) => sum + (p.total_points_issued || 0), 0);
  const totalRedeemed = programs.reduce((sum, p) => sum + (p.total_points_redeemed || 0), 0);
  const redemptionRate = totalIssued > 0 ? ((totalRedeemed / totalIssued) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Program Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">Total Issued</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalIssued.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">Redemption Rate</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{redemptionRate}%</p>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Program Comparison</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="issued" fill="#3b82f6" name="Issued" />
                  <Bar dataKey="redeemed" fill="#10b981" name="Redeemed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}