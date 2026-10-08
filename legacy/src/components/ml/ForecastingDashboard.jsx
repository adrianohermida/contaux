/**
 * ForecastingDashboard Component
 * Display predictive analytics and forecasts
 */

import React, { useState } from 'react';
import { usePredictiveAnalytics } from '../hooks/usePredictiveAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';
import PredictionCard from './PredictionCard';

export default function ForecastingDashboard({ workspaceId, predictions = [] }) {
  const { getPredictionStats, getInsights } = usePredictiveAnalytics(workspaceId, predictions);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  const stats = getPredictionStats();
  const insights = getInsights();

  // Prepare chart data
  const chartData = selectedPrediction
    ? [
        ...selectedPrediction.predictions.slice(0, 5).map((pred, idx) => ({
          period: `P${pred.period}`,
          predicted: pred.value,
          lower: pred.lower_bound,
          upper: pred.upper_bound,
        })),
      ]
    : [];

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Predictive Analytics</h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Predictions</p>
                <p className="text-3xl font-bold dark:text-slate-100">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Confidence</p>
                <p className="text-3xl font-bold dark:text-slate-100">{stats.avgConfidence}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Upward Trends</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.trendBreakdown.up}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <p className="font-medium text-blue-900 dark:text-blue-200">{insight.title}</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Forecast Chart */}
      {selectedPrediction && chartData.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">
              {selectedPrediction.name} - Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3b82f6"
                  name="Prediction"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#9ca3af"
                  name="Lower Bound"
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#9ca3af"
                  name="Upper Bound"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Predictions List */}
      {predictions.length === 0 ? (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-12 pb-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No predictions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              onClick={() => setSelectedPrediction(prediction)}
              className="cursor-pointer"
            >
              <PredictionCard prediction={prediction} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}