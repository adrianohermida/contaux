/**
 * LazyLoadingManager Component
 * Configure and monitor lazy loading
 */

import React, { useState } from 'react';
import { useLazyLoadStrategy } from '../hooks/useLazyLoadStrategy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, CheckCircle, AlertTriangle } from 'lucide-react';

export default function LazyLoadingManager() {
  const { loadedElements, visibleElements, createObserver, prefetchResource, preloadResource } =
    useLazyLoadStrategy();
  const [strategy, setStrategy] = useState('intersection-observer');
  const [metrics, setMetrics] = useState([
    { time: '0s', loaded: 0, visible: 0 },
    { time: '1s', loaded: 5, visible: 3 },
    { time: '2s', loaded: 15, visible: 8 },
    { time: '3s', loaded: 28, visible: 12 },
  ]);

  React.useEffect(() => {
    createObserver();
  }, [createObserver]);

  const handlePrefetch = () => {
    prefetchResource('/api/data', 'fetch');
  };

  const handlePreload = () => {
    preloadResource('/fonts/main.woff2', 'font');
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Lazy Loading Manager</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">{strategy}</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Loaded Elements</p>
                <p className="text-3xl font-bold dark:text-slate-100">{loadedElements.size}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Visible Elements</p>
                <p className="text-3xl font-bold dark:text-slate-100">{visibleElements.size}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Load Efficiency</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {loadedElements.size > 0 ? ((visibleElements.size / loadedElements.size) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading Progress Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Load Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="loaded" stroke="#3b82f6" name="Loaded" />
              <Line type="monotone" dataKey="visible" stroke="#10b981" name="Visible" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strategy Configuration */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Strategy Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium dark:text-slate-100">Lazy Loading Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="intersection-observer">Intersection Observer</option>
              <option value="native">Native Lazy Loading</option>
              <option value="hybrid">Hybrid Strategy</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium dark:text-slate-100">Threshold</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.5"
              className="w-full"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400">0.5 = Load when 50% visible</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium dark:text-slate-100">Root Margin</label>
            <input
              type="text"
              placeholder="50px"
              defaultValue="50px"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resource Optimization */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Resource Optimization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={handlePrefetch}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Prefetch Resources
          </button>
          <button
            onClick={handlePreload}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
          >
            Preload Critical Assets
          </button>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
            Prefetch: Load in idle time. Preload: Load immediately.
          </p>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm dark:text-slate-100">Intersection Observer: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm dark:text-slate-100">Lazy Loading: Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-sm dark:text-slate-100">Memory Usage: {loadedElements.size * 2.5} MB</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}