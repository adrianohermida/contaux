/**
 * CustomMetricsBuilder Component
 * Build and manage custom metrics
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save } from 'lucide-react';

export default function CustomMetricsBuilder() {
  const [metrics, setMetrics] = useState([
    {
      id: 1,
      name: 'Revenue per User',
      formula: 'totalRevenue / uniqueUsers',
      active: true,
    },
    {
      id: 2,
      name: 'Conversion Efficiency',
      formula: 'conversions / pageViews * 100',
      active: true,
    },
  ]);

  const [newMetric, setNewMetric] = useState({
    name: '',
    formula: '',
  });

  const handleAddMetric = () => {
    if (newMetric.name && newMetric.formula) {
      setMetrics([
        ...metrics,
        {
          id: Math.max(...metrics.map((m) => m.id), 0) + 1,
          ...newMetric,
          active: true,
        },
      ]);
      setNewMetric({ name: '', formula: '' });
    }
  };

  const handleDeleteMetric = (id) => {
    setMetrics(metrics.filter((m) => m.id !== id));
  };

  const handleToggleMetric = (id) => {
    setMetrics(
      metrics.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Custom Metrics Builder</h2>
      </div>

      {/* Create New Metric */}
      <Card className="dark:bg-slate-800 dark:border-slate-700 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Create New Metric</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Metric Name
            </label>
            <input
              type="text"
              value={newMetric.name}
              onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
              placeholder="e.g., Revenue per User"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Formula
            </label>
            <input
              type="text"
              value={newMetric.formula}
              onChange={(e) => setNewMetric({ ...newMetric, formula: e.target.value })}
              placeholder="e.g., totalRevenue / uniqueUsers"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Use available metrics: totalRevenue, uniqueUsers, pageViews, conversions
            </p>
          </div>

          <Button
            onClick={handleAddMetric}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Metric
          </Button>
        </CardContent>
      </Card>

      {/* Active Metrics */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">
            Active Metrics ({metrics.filter((m) => m.active).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {metric.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">
                    {metric.formula}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={metric.active}
                    onChange={() => handleToggleMetric(metric.id)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <button
                    onClick={() => handleDeleteMetric(metric.id)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metric Templates */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Popular Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { name: 'Customer LTV', formula: 'avgOrderValue * avgOrderFrequency' },
            { name: 'CAC', formula: 'totalMarketingCost / newCustomers' },
            { name: 'ROI', formula: 'gain / cost * 100' },
            { name: 'Churn Rate', formula: 'lostCustomers / startingCustomers * 100' },
          ].map((template, idx) => (
            <button
              key={idx}
              onClick={() => setNewMetric(template)}
              className="w-full p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-left transition-colors"
            >
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {template.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">
                {template.formula}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}