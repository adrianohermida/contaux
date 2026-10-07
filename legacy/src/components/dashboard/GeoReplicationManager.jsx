/**
 * GeoReplicationManager Component
 * Geo-replication and cross-region data synchronization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Map, CheckCircle } from 'lucide-react';

export default function GeoReplicationManager() {
  const [replicationStats] = useState({
    totalReplicationTasks: 8945,
    successRate: 99.95,
    avgReplicationTime: 234,
    failoverEvents: 1,
    lastSyncTime: '3 seconds ago',
  });

  const [replicationTimeline] = useState([
    { time: '00:00', tasks: 324, latency: 245 },
    { time: '04:00', tasks: 298, latency: 239 },
    { time: '08:00', tasks: 1256, latency: 248 },
    { time: '12:00', tasks: 2834, latency: 232 },
    { time: '16:00', tasks: 2450, latency: 241 },
    { time: '20:00', tasks: 1783, latency: 234 },
  ]);

  const [replicationTasks] = useState([
    {
      timestamp: '14:45:23',
      key: 'user_profile_123',
      source: 'us-east',
      destinations: ['eu-west', 'ap-south'],
      status: 'completed',
      time: '234ms',
    },
    {
      timestamp: '14:45:18',
      key: 'session_data_456',
      source: 'eu-west',
      destinations: ['us-east', 'ap-south'],
      status: 'completed',
      time: '218ms',
    },
    {
      timestamp: '14:45:12',
      key: 'cache_data_789',
      source: 'ap-south',
      destinations: ['us-east', 'eu-west'],
      status: 'in-progress',
      time: '—',
    },
  ]);

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Geo-Replication</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {replicationStats.successRate}% Success
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Replicati...Tasks</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              {replicationStats.totalReplicationTasks.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Replication Time</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {replicationStats.avgReplicationTime}ms
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Last Sync</p>
            <p className="text-lg font-bold dark:text-slate-100">{replicationStats.lastSyncTime}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Failover Events</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {replicationStats.failoverEvents}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Replication Timeline */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Replication Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={replicationTimeline}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="tasks"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorTasks)"
                name="Tasks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Replication Log */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Map className="w-4 h-4" />
            Replication Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Timestamp
                  </th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Source</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {replicationTasks.map((task, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {task.timestamp}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{task.source}</td>
                    <td className="py-2 px-3">
                      <Badge
                        className={
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900'
                        }
                      >
                        {task.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{task.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Replication Control</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Trigger Full Sync</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify Consistency
          </Button>
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">Reset Lag</Button>
        </CardContent>
      </Card>
    </div>
  );
}