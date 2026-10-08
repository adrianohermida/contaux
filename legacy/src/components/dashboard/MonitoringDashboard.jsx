/**
 * MonitoringDashboard Component
 * Real-time system monitoring visualization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle, Zap } from 'lucide-react';

export default function MonitoringDashboard() {
  const [data] = useState([
    { time: '10:00', health: 94, rps: 340, errors: 0.02 },
    { time: '10:05', health: 96, rps: 355, errors: 0.01 },
    { time: '10:10', health: 93, rps: 345, errors: 0.03 },
    { time: '10:15', health: 97, rps: 360, errors: 0.01 },
    { time: '10:20', health: 95, rps: 342, errors: 0.02 },
  ]);

  const metrics = [
    { label: 'System Health', value: '95%', color: 'text-green-600 dark:text-green-400' },
    { label: 'Uptime', value: '99.98%', color: 'text-green-600 dark:text-green-400' },
    { label: 'Active Users', value: '1,247', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Avg Response', value: '145ms', color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">System Monitoring</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">Live</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-6">
              <p className="text-xs text-slate-600 dark:text-slate-400">{metric.label}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Trend Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Activity className="w-4 h-4" />
            Health Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="health" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <AlertCircle className="w-4 h-4" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✓ System health optimal (95%)
            </p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              ℹ Peak traffic detected: 360 RPS
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}