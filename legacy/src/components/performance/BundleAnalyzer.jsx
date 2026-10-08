/**
 * BundleAnalyzer Component
 * Visualize bundle size and dependencies
 */

import React, { useState } from 'react';
import { usePerformanceOptimizer } from '../hooks/usePerformanceOptimizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, AlertCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function BundleAnalyzer() {
  const { bundleStats, analyzeBundleSize, identifyCodeSplittingOpportunities } =
    usePerformanceOptimizer();
  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    analyzeBundleSize();
  }, [analyzeBundleSize]);

  if (!bundleStats) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="pt-12 pb-12 text-center">
          <Package className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Analyzing bundle...</p>
        </CardContent>
      </Card>
    );
  }

  const opportunities = identifyCodeSplittingOpportunities(bundleStats.chunks);
  const chartData = bundleStats.chunks.map((chunk) => ({
    name: chunk.name,
    size: chunk.size,
    gzip: chunk.gzipSize,
  }));

  const pieData = bundleStats.chunks.map((chunk) => ({
    name: chunk.name,
    value: chunk.size,
  }));

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Bundle Analyzer</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Size</p>
                <p className="text-3xl font-bold dark:text-slate-100">
                  {(bundleStats.totalSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gzip Size</p>
                <p className="text-3xl font-bold dark:text-slate-100">
                  {(bundleStats.gzipSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Compression</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {((1 - bundleStats.gzipSize / bundleStats.totalSize) * 100).toFixed(0)}%
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900">Good</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Size Comparison Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Size Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${(value / 1024).toFixed(1)} KB`} />
              <Legend />
              <Bar dataKey="size" fill="#3b82f6" name="Raw Size" />
              <Bar dataKey="gzip" fill="#10b981" name="Gzip Size" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Size Distribution */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Size Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(value / 1024).toFixed(1)} KB`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chunk Details */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Chunk Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bundleStats.chunks.map((chunk, idx) => (
              <div
                key={idx}
                onClick={() => setSelected(selected === idx ? null : idx)}
                className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium dark:text-slate-100">{chunk.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {chunk.modules} modules
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold dark:text-slate-100">
                      {(chunk.size / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {(chunk.gzipSize / 1024).toFixed(1)} KB (gzip)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Splitting Opportunities */}
      {opportunities.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-base dark:text-slate-100">Optimization Opportunities</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {opportunities.slice(0, 3).map((opp, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                <p className="font-medium text-amber-900 dark:text-amber-200">{opp.module}</p>
                <p className="text-sm text-amber-800 dark:text-amber-300">{opp.potential}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Estimated savings: {(opp.estimatedGain / 1024).toFixed(1)} KB
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}