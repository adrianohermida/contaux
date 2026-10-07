/**
 * MultiRegionDashboard Component
 * Global multi-region cache monitoring and management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Globe, TrendingDown } from 'lucide-react';

export default function MultiRegionDashboard() {
  const [globalStatus] = useState({
    totalRegions: 3,
    healthyRegions: 2,
    globalLatency: 145,
    consistency: 'strong',
    failoverStatus: 'healthy',
  });

  const [regionData] = useState([
    { region: 'us-east', latency: 42, dataSize: 450, status: 'healthy' },
    { region: 'eu-west', latency: 89, dataSize: 480, status: 'healthy' },
    { region: 'ap-south', latency: 156, dataSize: 420, status: 'degraded' },
  ]);

  const [latencyTimeline] = useState([
    { time: '00:00', 'us-east': 45, 'eu-west': 85, 'ap-south': 160 },
    { time: '04:00', 'us-east': 42, 'eu-west': 88, 'ap-south': 155 },
    { time: '08:00', 'us-east': 48, 'eu-west': 92, 'ap-south': 165 },
    { time: '12:00', 'us-east': 41, 'eu-west': 87, 'ap-south': 158 },
    { time: '16:00', 'us-east': 43, 'eu-west': 90, 'ap-south': 162 },
    { time: '20:00', 'us-east': 42, 'eu-west': 89, 'ap-south': 156 },
  ]);

  const [regions] = useState([
    {
      name: 'us-east',
      status: 'healthy',
      latency: '42ms',
      dataSize: '450 MB',
      uptime: '99.99%',
      replicas: 3,
    },
    {
      name: 'eu-west',
      status: 'healthy',
      latency: '89ms',
      dataSize: '480 MB',
      uptime: '99.98%',
      replicas: 3,
    },
    {
      name: 'ap-south',
      status: 'degraded',
      latency: '156ms',
      dataSize: '420 MB',
      uptime: '98.50%',
      replicas: 2,
    },
  ]);

  const getStatusColor = (status) => {
    return status === 'healthy'
      ? 'bg-green-100 text-green-800 dark:bg-green-900'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Multi-Region Cache</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {globalStatus.healthyRegions}/{globalStatus.totalRegions} Regions Healthy
        </Badge>
      </div>

      {/* Global Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Regions</p>
            <p className="text-2xl font-bold dark:text-slate-100">{globalStatus.totalRegions}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Healthy Regions</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {globalStatus.healthyRegions}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Global Latency</p>
            <p className="text-2xl font-bold dark:text-slate-100">{globalStatus.globalLatency}ms</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Consistency</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {globalStatus.consistency.toUpperCase()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Region Latency Comparison */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <TrendingDown className="w-4 h-4" />
            Region Latency & Data Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <XAxis dataKey="region" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="latency" fill="#3b82f6" name="Latency (ms)" />
              <Bar yAxisId="right" dataKey="dataSize" fill="#10b981" name="Data Size (MB)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latency Timeline */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Latency Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyTimeline}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="us-east" stroke="#3b82f6" name="US East" />
              <Line type="monotone" dataKey="eu-west" stroke="#10b981" name="EU West" />
              <Line type="monotone" dataKey="ap-south" stroke="#f59e0b" name="AP South" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regions Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Globe className="w-4 h-4" />
            Regional Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Region</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Latency</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Data Size</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {r.name}
                    </td>
                    <td className="py-2 px-3">
                      <Badge className={getStatusColor(r.status)}>
                        {r.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{r.latency}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{r.dataSize}</td>
                    <td className="py-2 px-3 text-green-600 dark:text-green-400 font-medium">
                      {r.uptime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}