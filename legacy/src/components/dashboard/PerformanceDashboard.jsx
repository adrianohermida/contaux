/**
 * PerformanceDashboard Component
 * System performance monitoring and analytics
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingDown, Zap } from 'lucide-react';

export default function PerformanceDashboard() {
  const [perfStats] = useState({
    avgPageLoad: 285,
    avgApiLatency: 145,
    cacheHitRate: 82.3,
    lcpScore: 1.2,
    fidScore: 45,
    clsScore: 0.08,
  });

  const [performanceTimeline] = useState([
    { time: '00:00', pageLoad: 290, apiLatency: 150 },
    { time: '06:00', pageLoad: 278, apiLatency: 138 },
    { time: '12:00', pageLoad: 295, apiLatency: 152 },
    { time: '18:00', pageLoad: 275, apiLatency: 140 },
    { time: '23:00', pageLoad: 285, apiLatency: 145 },
  ]);

  const getStatusColor = (value, threshold) => {
    return value <= threshold
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Performance Metrics</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">HEALTHY</Badge>
      </div>

      {/* Core Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Page Load Time</p>
            <p className={`text-2xl font-bold ${getStatusColor(perfStats.avgPageLoad, 3000)}`}>
              {perfStats.avgPageLoad}ms
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">API Latency</p>
            <p className={`text-2xl font-bold ${getStatusColor(perfStats.avgApiLatency, 200)}`}>
              {perfStats.avgApiLatency}ms
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Cache Hit Rate</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {perfStats.cacheHitRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Zap className="w-4 h-4" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                LCP (Largest Contentful Paint)
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {perfStats.lcpScore}s ✓
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                FID (First Input Delay)
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {perfStats.fidScore}ms ✓
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                CLS (Cumulative Layout Shift)
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {perfStats.clsScore} ✓
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Timeline */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Activity className="w-4 h-4" />
            Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTimeline}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pageLoad" stroke="#3b82f6" name="Page Load (ms)" />
              <Line type="monotone" dataKey="apiLatency" stroke="#10b981" name="API Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Optimization Info */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <TrendingDown className="w-4 h-4" />
            Optimizations Active
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900">✓</Badge>
            <span className="text-sm text-slate-700 dark:text-slate-300">Gzip Compression</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900">✓</Badge>
            <span className="text-sm text-slate-700 dark:text-slate-300">Minification</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900">✓</Badge>
            <span className="text-sm text-slate-700 dark:text-slate-300">Lazy Loading</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900">✓</Badge>
            <span className="text-sm text-slate-700 dark:text-slate-300">CDN Caching</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}