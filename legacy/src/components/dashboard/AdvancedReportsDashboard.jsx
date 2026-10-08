/**
 * AdvancedReportsDashboard Component
 * Advanced reporting and analytics dashboard
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, Clock } from 'lucide-react';

export default function AdvancedReportsDashboard() {
  const [reportStats] = useState({
    totalReports: 156,
    generatedToday: 12,
    avgGenerationTime: '2.4s',
    successRate: 99.8,
    lastGenerated: '5 minutes ago',
  });

  const [reportTimeline] = useState([
    { time: '00:00', generated: 8, failed: 0 },
    { time: '06:00', generated: 14, failed: 1 },
    { time: '12:00', generated: 32, failed: 0 },
    { time: '18:00', generated: 28, failed: 1 },
    { time: '23:00', generated: 12, failed: 0 },
  ]);

  const [recentReports] = useState([
    {
      id: 'rpt_001',
      title: 'Monthly Sales Report',
      type: 'sales',
      generated: '5 min ago',
      pages: 12,
      size: '2.4 MB',
    },
    {
      id: 'rpt_002',
      title: 'Customer Analytics',
      type: 'analytics',
      generated: '23 min ago',
      pages: 8,
      size: '1.8 MB',
    },
    {
      id: 'rpt_003',
      title: 'Financial Summary',
      type: 'financial',
      generated: '1 hour ago',
      pages: 15,
      size: '3.2 MB',
    },
  ]);

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Advanced Reports</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {reportStats.successRate}% Success
        </Badge>
      </div>

      {/* Report Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Reports</p>
            <p className="text-2xl font-bold dark:text-slate-100">{reportStats.totalReports}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Generated Today</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {reportStats.generatedToday}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Generation</p>
            <p className="text-2xl font-bold dark:text-slate-100">{reportStats.avgGenerationTime}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Last Generated</p>
            <p className="text-lg font-bold dark:text-slate-100">{reportStats.lastGenerated}</p>
          </CardContent>
        </Card>
      </div>

      {/* Generation Timeline */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <TrendingUp className="w-4 h-4" />
            Report Generation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportTimeline}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="generated" stroke="#3b82f6" name="Generated" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <FileText className="w-4 h-4" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report, idx) => (
              <div key={idx} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{report.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {report.pages} pages • {report.size}
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{report.generated}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Actions */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sales Report</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">Analytics Report</Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">Financial Report</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Custom Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}