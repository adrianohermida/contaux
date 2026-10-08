/**
 * AdvancedAnalyticsDashboard Component
 * Real-time analytics and reporting
 */

import React, { useState } from 'react';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Download, Filter } from 'lucide-react';

export default function AdvancedAnalyticsDashboard() {
  const {
    metrics,
    reportData,
    buildReport,
    exportReport,
    comparePeriods,
    analyzeTrend,
    getMetricsSummary,
  } = useAdvancedAnalytics();

  const [selectedMetric, setSelectedMetric] = useState('pageViews');
  const [exportFormat, setExportFormat] = useState('csv');
  const [comparisonPeriod1, setComparisonPeriod1] = useState(null);
  const [comparisonPeriod2, setComparisonPeriod2] = useState(null);

  // Sample data for demo
  React.useEffect(() => {
    const sampleData = [
      {
        day: 'Mon',
        userId: 'user1',
        pageViews: 150,
        sessions: 5,
        sessionDuration: 1200,
        converted: true,
      },
      {
        day: 'Mon',
        userId: 'user2',
        pageViews: 120,
        sessions: 3,
        sessionDuration: 900,
        converted: false,
      },
      {
        day: 'Tue',
        userId: 'user1',
        pageViews: 180,
        sessions: 6,
        sessionDuration: 1500,
        converted: true,
      },
      {
        day: 'Tue',
        userId: 'user3',
        pageViews: 200,
        sessions: 7,
        sessionDuration: 1800,
        converted: true,
      },
      {
        day: 'Wed',
        userId: 'user2',
        pageViews: 160,
        sessions: 5,
        sessionDuration: 1200,
        converted: false,
      },
    ];

    buildReport(sampleData, {
      groupBy: 'day',
      includeMetrics: ['pageViews', 'uniqueUsers', 'bounceRate', 'conversionRate'],
    });
  }, [buildReport]);

  const summary = getMetricsSummary();
  const trend = selectedMetric ? analyzeTrend(selectedMetric) : null;

  const handleExport = () => {
    const data = exportReport(exportFormat);
    const element = document.createElement('a');
    const file = new Blob([data], {
      type: exportFormat === 'csv' ? 'text/csv' : 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = `report.${exportFormat}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Advanced Analytics</h2>
        <Button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export {exportFormat.toUpperCase()}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Page Views</p>
              <p className="text-3xl font-bold dark:text-slate-100">{metrics.pageViews}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Unique Users</p>
              <p className="text-3xl font-bold dark:text-slate-100">{metrics.uniqueUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Bounce Rate</p>
              <p className="text-3xl font-bold dark:text-slate-100">
                {metrics.bounceRate.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Duration</p>
              <p className="text-3xl font-bold dark:text-slate-100">
                {Math.round(metrics.avgSessionDuration)}s
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Conversion</p>
              <p className="text-3xl font-bold dark:text-slate-100">
                {metrics.conversionRate.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      {trend && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className={`w-8 h-8 ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {trend.metric} Trend
                </p>
                <p className="text-lg font-bold dark:text-slate-100">
                  {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                </p>
              </div>
              <Badge className={trend.direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {trend.direction}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Metrics Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {reportData[0]?.pageViews !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="#3b82f6"
                    name="Page Views"
                  />
                )}
                {reportData[0]?.uniqueUsers !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="uniqueUsers"
                    stroke="#10b981"
                    name="Unique Users"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Conversion Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {reportData[0]?.conversionRate !== undefined && (
                  <Bar dataKey="conversionRate" fill="#f59e0b" name="Conversion Rate" />
                )}
                {reportData[0]?.bounceRate !== undefined && (
                  <Bar dataKey="bounceRate" fill="#ef4444" name="Bounce Rate" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Report Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">Period</th>
                  <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">
                    Page Views
                  </th>
                  <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">
                    Users
                  </th>
                  <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">
                    Bounce Rate
                  </th>
                  <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="py-2 px-4 dark:text-slate-100">{row.period}</td>
                    <td className="py-2 px-4 dark:text-slate-100">{row.pageViews}</td>
                    <td className="py-2 px-4 dark:text-slate-100">{row.uniqueUsers}</td>
                    <td className="py-2 px-4 dark:text-slate-100">
                      {row.bounceRate?.toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 dark:text-slate-100">
                      {row.conversionRate?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button
              onClick={() => setExportFormat('csv')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                exportFormat === 'csv'
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
              }`}
            >
              CSV
            </button>
            <button
              onClick={() => setExportFormat('json')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                exportFormat === 'json'
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
              }`}
            >
              JSON
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}