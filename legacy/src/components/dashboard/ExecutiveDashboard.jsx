/**
 * ExecutiveDashboard Component
 * Executive-level business intelligence dashboard
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Target } from 'lucide-react';

export default function ExecutiveDashboard() {
  const [metrics] = useState({
    revenue: { current: 245000, target: 250000, trend: '+12%' },
    growth: { rate: '18.5%', trend: '+3.2%' },
    efficiency: { score: '87.3%', trend: '+2.1%' },
    health: 'excellent',
  });

  const [forecastData] = useState([
    { month: 'Jan', revenue: 200, growth: 15 },
    { month: 'Feb', revenue: 215, growth: 16.5 },
    { month: 'Mar', revenue: 230, growth: 17.8 },
    { month: 'Apr', revenue: 245, growth: 18.5 },
    { month: 'May', revenue: 260, growth: 19.2 },
    { month: 'Jun', revenue: 280, growth: 20.5 },
  ]);

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900';
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Executive Dashboard</h2>
        <Badge className={getHealthColor(metrics.health)}>
          {metrics.health.toUpperCase()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              ${metrics.revenue.current.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {metrics.revenue.trend} vs target
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Growth Rate</p>
            <p className="text-2xl font-bold dark:text-slate-100">{metrics.growth.rate}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {metrics.growth.trend} YoY
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Efficiency Score</p>
            <p className="text-2xl font-bold dark:text-slate-100">{metrics.efficiency.score}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {metrics.efficiency.trend} above benchmark
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <TrendingUp className="w-4 h-4" />
            6-Month Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <AlertCircle className="w-4 h-4" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✓ Revenue on track: 98% of target
            </p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              ℹ Growth accelerating: +3.2% vs last month
            </p>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠ Monitor Q2 trends: Efficiency may decline
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}