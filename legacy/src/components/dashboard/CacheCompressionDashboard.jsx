/**
 * CacheCompressionDashboard Component
 * Advanced caching with compression visualization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Upload, Trash2, Zap } from 'lucide-react';

export default function CacheCompressionDashboard() {
  const [stats] = useState({
    originalSize: 2456789,
    compressedSize: 1234567,
    compressionRatio: 49.8,
    itemsStored: 156,
    persistenceEnabled: true,
    savings: '1,222,222 bytes',
  });

  const [compressionData] = useState([
    { name: 'Without Compression', size: 2456789 },
    { name: 'With Compression', size: 1234567 },
  ]);

  const [cacheBreakdown] = useState([
    { name: 'User Data', value: 35, color: '#3b82f6' },
    { name: 'Products', value: 28, color: '#10b981' },
    { name: 'Analytics', value: 22, color: '#f59e0b' },
    { name: 'Metadata', value: 15, color: '#8b5cf6' },
  ]);

  const [cachedItems] = useState([
    { key: 'user_profile', size: '245 KB', compressed: '89 KB', ratio: 63.7, type: 'User Data' },
    { key: 'products_list', size: '567 KB', compressed: '234 KB', ratio: 58.7, type: 'Products' },
    { key: 'analytics_data', size: '234 KB', compressed: '112 KB', ratio: 52.1, type: 'Analytics' },
  ]);

  const formatBytes = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Cache Compression</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {stats.itemsStored} Items
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Original Size</p>
            <p className="text-2xl font-bold dark:text-slate-100">{formatBytes(stats.originalSize)}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Compressed Size</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatBytes(stats.compressedSize)}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Compression Ratio</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.compressionRatio}%</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Space Saved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.savings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Compression Comparison Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Zap className="w-4 h-4" />
            Size Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={compressionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="size" fill="#3b82f6" name="Size (bytes)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cache Breakdown Pie Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Cache Breakdown by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cacheBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} ${entry.value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {cacheBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cached Items Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Cached Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Key</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Type</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Original</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Compressed</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {cachedItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {item.key}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{item.type}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{item.size}</td>
                    <td className="py-2 px-3 text-green-600 dark:text-green-400">{item.compressed}</td>
                    <td className="py-2 px-3">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
                        {item.ratio}%
                      </Badge>
                    </td>
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
          <CardTitle className="text-base dark:text-slate-100">Cache Management</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Download className="w-4 h-4" />
            Export Cache
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="w-4 h-4" />
            Import Cache
          </Button>
          <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}