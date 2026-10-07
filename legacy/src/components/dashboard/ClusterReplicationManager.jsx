/**
 * ClusterReplicationManager Component
 * Cluster replication monitoring and management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp } from 'lucide-react';

export default function ClusterReplicationManager() {
  const [replicationStats] = useState({
    totalReplications: 15847,
    successRate: 99.98,
    avgLatency: 145,
    conflictResolutions: 8,
    failoverCount: 0,
  });

  const [replicationTimeline] = useState([
    { time: '00:00', replications: 245, conflicts: 1 },
    { time: '04:00', replications: 234, conflicts: 0 },
    { time: '08:00', replications: 892, conflicts: 2 },
    { time: '12:00', replications: 3456, conflicts: 1 },
    { time: '16:00', replications: 5678, conflicts: 3 },
    { time: '20:00', replications: 5342, conflicts: 1 },
  ]);

  const [replicationLog] = useState([
    {
      timestamp: '14:35:42',
      key: 'user_profile_123',
      primary: 'node_0',
      replicas: ['node_1', 'node_2'],
      status: 'completed',
      latency: '142ms',
    },
    {
      timestamp: '14:35:39',
      key: 'product_cache_456',
      primary: 'node_2',
      replicas: ['node_3', 'node_4'],
      status: 'completed',
      latency: '148ms',
    },
    {
      timestamp: '14:35:35',
      key: 'session_data_789',
      primary: 'node_1',
      replicas: ['node_3', 'node_0'],
      status: 'pending',
      latency: '—',
    },
  ]);

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Cluster Replication</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {replicationStats.successRate}% Success Rate
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Replications</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              {replicationStats.totalReplications.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Latency</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {replicationStats.avgLatency}ms
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Conflict Resolutions</p>
            <p className="text-2xl font-bold dark:text-slate-100">{replicationStats.conflictResolutions}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Failover Events</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {replicationStats.failoverCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Replication Timeline */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <TrendingUp className="w-4 h-4" />
            Replication Activity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={replicationTimeline}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="replications" stroke="#3b82f6" name="Replications" />
              <Line type="monotone" dataKey="conflicts" stroke="#ef4444" name="Conflicts" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Replication Log */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Replication Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Timestamp</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Key</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Primary</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Latency</th>
                </tr>
              </thead>
              <tbody>
                {replicationLog.map((log, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {log.timestamp}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {log.key}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{log.primary}</td>
                    <td className="py-2 px-3">
                      <Badge
                        className={
                          log.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
                        }
                      >
                        {log.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{log.latency}</td>
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