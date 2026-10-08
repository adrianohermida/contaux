/**
 * IndexMonitor Component
 * Database index monitoring and optimization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function IndexMonitor() {
  const [indexes] = useState([
    {
      name: 'users_pk',
      table: 'users',
      column: 'id',
      cardinality: 'high',
      usage: 2847,
      size: '2.5 MB',
      lastUsed: '2 min ago',
      health: 'excellent',
    },
    {
      name: 'orders_user_idx',
      table: 'orders',
      column: 'user_id',
      cardinality: 'high',
      usage: 1245,
      size: '1.8 MB',
      lastUsed: '5 min ago',
      health: 'good',
    },
    {
      name: 'products_category_idx',
      table: 'products',
      column: 'category',
      cardinality: 'medium',
      usage: 356,
      size: '856 KB',
      lastUsed: '23 min ago',
      health: 'warning',
    },
  ]);

  const [recommendations] = useState([
    {
      table: 'orders',
      column: 'status',
      reason: 'Frequently used in WHERE clauses',
      estimatedGain: '35%',
      priority: 'high',
    },
    {
      table: 'products',
      column: 'sku',
      reason: 'Used for lookups',
      estimatedGain: '22%',
      priority: 'medium',
    },
  ]);

  const [usageData] = useState([
    { hour: '00:00', hits: 245 },
    { hour: '04:00', hits: 156 },
    { hour: '08:00', hits: 892 },
    { hour: '12:00', hits: 1234 },
    { hour: '16:00', hits: 1567 },
    { hour: '20:00', hits: 1245 },
  ]);

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Index Monitor</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {indexes.length} Indexes
        </Badge>
      </div>

      {/* Index Usage Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <TrendingUp className="w-4 h-4" />
            Index Usage Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hits" fill="#3b82f6" name="Index Hits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Indexes Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Active Indexes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Index Name
                  </th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Table
                  </th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Column
                  </th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Usage
                  </th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Size
                  </th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Health
                  </th>
                </tr>
              </thead>
              <tbody>
                {indexes.map((idx, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {idx.name}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{idx.table}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{idx.column}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{idx.usage}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{idx.size}</td>
                    <td className="py-2 px-3">
                      <Badge className={getHealthColor(idx.health)}>
                        {idx.health.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <AlertTriangle className="w-4 h-4" />
            Missing Indexes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {rec.table}.{rec.column}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{rec.reason}</p>
                </div>
                <Badge
                  className={
                    rec.priority === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
                  }
                >
                  {rec.priority.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                Est. Gain: {rec.estimatedGain}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Health Summary */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <CheckCircle className="w-4 h-4" />
            Index Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Indexes</p>
            <p className="text-3xl font-bold dark:text-slate-100">{indexes.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Healthy</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {indexes.filter((i) => i.health === 'excellent' || i.health === 'good').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">At Risk</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {indexes.filter((i) => i.health === 'warning').length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}