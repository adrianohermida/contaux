/**
 * CacheManager Component
 * Advanced cache management and monitoring
 */

import React, { useState } from 'react';
import { useAdvancedCache } from '../hooks/useAdvancedCache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Database, Zap, Trash2 } from 'lucide-react';

export default function CacheManager() {
  const {
    getCacheHitRate,
    getCacheSize,
    getCacheEntries,
    cacheStats,
    clearCache,
    invalidateCache,
  } = useAdvancedCache();
  const [metricsHistory, setMetricsHistory] = useState([
    { time: '0s', hits: 0, misses: 0, hitRate: 0 },
    { time: '5s', hits: 15, misses: 5, hitRate: 75 },
    { time: '10s', hits: 32, misses: 8, hitRate: 80 },
    { time: '15s', hits: 52, misses: 10, hitRate: 84 },
  ]);

  const cacheEntries = getCacheEntries();
  const hitRate = getCacheHitRate();
  const cacheSize = getCacheSize();

  // Prepare chart data
  const sizeData = cacheEntries.slice(-10).map((entry, idx) => ({
    index: idx,
    age: (entry.age / 1000).toFixed(1),
    ttl: (entry.ttl / 1000).toFixed(1),
  }));

  const handleClearCache = () => {
    clearCache();
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Cache Manager</h2>
        <button
          onClick={handleClearCache}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cache
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cache Entries</p>
                <p className="text-3xl font-bold dark:text-slate-100">{cacheSize}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cache Hits</p>
                <p className="text-3xl font-bold dark:text-slate-100">{cacheStats.hits}</p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Hit Rate</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {hitRate.toFixed(1)}%
                </p>
              </div>
              {hitRate > 80 && <Badge className="bg-green-100 text-green-800 dark:bg-green-900">Excellent</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Evictions</p>
                <p className="text-3xl font-bold dark:text-slate-100">{cacheStats.evictions}</p>
              </div>
              <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700">{cacheSize}/100</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricsHistory}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="hits"
                stroke="#10b981"
                name="Cache Hits"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="misses"
                stroke="#ef4444"
                name="Cache Misses"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="hitRate"
                stroke="#3b82f6"
                name="Hit Rate %"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cache Entries */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Cache Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {cacheEntries.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cacheEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium dark:text-slate-100 truncate">{entry.key}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Age: {entry.age}ms | TTL: {entry.ttl}ms
                    </p>
                  </div>
                  <button
                    onClick={() => invalidateCache(entry.key)}
                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No cached entries</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Total Hits</p>
              <p className="text-2xl font-bold dark:text-slate-100">{cacheStats.hits}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Total Misses</p>
              <p className="text-2xl font-bold dark:text-slate-100">{cacheStats.misses}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Total Evictions</p>
              <p className="text-2xl font-bold dark:text-slate-100">{cacheStats.evictions}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Current Size</p>
              <p className="text-2xl font-bold dark:text-slate-100">{cacheSize}/100</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}