/**
 * CacheStatsDashboard Component
 * Real-time cache monitoring and management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, RotateCcw, Activity, AlertCircle } from 'lucide-react';

export default function CacheStatsDashboard() {
  const [cacheStats, setCacheStats] = useState({
    hits: 2847,
    misses: 612,
    hitRate: 82.3,
    size: 45,
    evictions: 8,
    totalRequests: 3459,
  });

  const [cacheEntries, setCacheEntries] = useState([
    { key: 'user:1234', size: 2.5, hits: 156, ttl: 3600, age: 245 },
    { key: 'product:5678', size: 4.2, hits: 98, ttl: 3600, age: 612 },
    { key: 'analytics:q1', size: 8.5, hits: 234, ttl: 7200, age: 1245 },
    { key: 'report:monthly', size: 12.3, hits: 45, ttl: 86400, age: 3456 },
  ]);

  const [performanceData, setPerformanceData] = useState([
    { time: '00:00', hitRate: 78, memoryMB: 125 },
    { time: '04:00', hitRate: 81, memoryMB: 142 },
    { time: '08:00', hitRate: 85, memoryMB: 156 },
    { time: '12:00', hitRate: 88, memoryMB: 178 },
    { time: '16:00', hitRate: 82, memoryMB: 165 },
    { time: '20:00', hitRate: 84, memoryMB: 172 },
  ]);

  const isCritical = cacheStats.size >= 80;
  const cacheHealth = cacheStats.hitRate > 90 ? 'excellent' : cacheStats.hitRate > 75 ? 'good' : 'warning';

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Cache Statistics</h2>
        <Badge
          className={`${
            cacheHealth === 'excellent'
              ? 'bg-green-100 text-green-800 dark:bg-green-900'
              : cacheHealth === 'good'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
          }`}
        >
          {cacheHealth.toUpperCase()}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Hit Rate</p>
            <p className="text-3xl font-bold dark:text-slate-100">{cacheStats.hitRate}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {cacheStats.hits} hits
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Cache Size</p>
            <p className="text-3xl font-bold dark:text-slate-100">{cacheStats.size}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {cacheStats.totalRequests} requests
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Misses</p>
            <p className="text-3xl font-bold dark:text-slate-100">{cacheStats.misses}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {((cacheStats.misses / cacheStats.totalRequests) * 100).toFixed(1)}% rate
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Evictions</p>
            <p className="text-3xl font-bold dark:text-slate-100">{cacheStats.evictions}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Total purges
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Activity className="w-4 h-4" />
            Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="hitRate"
                stroke="#10b981"
                name="Hit Rate (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="memoryMB"
                stroke="#3b82f6"
                name="Memory (MB)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cache Entries Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Cache Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Key</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Size (KB)</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Hits</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">TTL (s)</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Age (s)</th>
                </tr>
              </thead>
              <tbody>
                {cacheEntries.map((entry, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {entry.key}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                      {entry.size.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                      {entry.hits}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                      {entry.ttl}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                      {entry.age}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alert if Critical */}
      {isCritical && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Cache Usage Critical
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Cache is at {cacheStats.size}% capacity. Consider clearing old entries or increasing cache size.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <RotateCcw className="w-4 h-4" />
          Warm Cache
        </Button>
        <Button variant="outline" className="flex items-center gap-2 dark:border-slate-600">
          <Trash2 className="w-4 h-4" />
          Clear Cache
        </Button>
      </div>
    </div>
  );
}