/**
 * AdvancedAnalyticsDashboard Component
 * Real-time analytics, custom metrics, and comprehensive reporting
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import { useAnalyticsDashboard } from '@/components/hooks/useAnalyticsDashboard';

export default function AdvancedAnalyticsDashboard() {
  const { analyticsState, exportData } = useAnalyticsDashboard();
  const [exportFormat, setExportFormat] = useState('csv');

  // Mock data for charts
  const chartData = [
    { name: 'Mon', users: 4000, revenue: 24000, conversion: 6.2 },
    { name: 'Tue', users: 5200, revenue: 32000, conversion: 7.1 },
    { name: 'Wed', users: 4800, revenue: 28000, conversion: 6.8 },
    { name: 'Thu', users: 6100, revenue: 38000, conversion: 8.3 },
    { name: 'Fri', users: 5800, revenue: 36000, conversion: 8.1 },
    { name: 'Sat', users: 5900, revenue: 37000, conversion: 8.5 },
    { name: 'Sun', users: 4200, revenue: 26000, conversion: 6.9 },
  ];

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Advanced Analytics
        </h2>
        <Button variant="outline" size="sm" className="dark:border-slate-600">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analyticsState.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Active Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analyticsState.activeUsers.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ${(analyticsState.revenue / 1000).toFixed(1)}K
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analyticsState.conversionRate.toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Users & Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Conversion Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="conversion" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Session Duration</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {analyticsState.avgSessionDuration.toFixed(1)}m
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Bounce Rate</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {analyticsState.bounceRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Revenue per User</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ${(analyticsState.revenue / analyticsState.totalUsers).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="excel">Excel</option>
              </select>
              <Button
                onClick={() => exportData(exportFormat)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700"
              >
                Download
              </Button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Export analytics data in your preferred format for further analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}