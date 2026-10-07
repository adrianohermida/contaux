/**
 * TimeSeriesForecast Component
 * Advanced time-series forecasting visualization
 */

import React, { useState } from 'react';
import { useTimeSeriesAnalysis } from '../hooks/useTimeSeriesAnalysis';
import { useSeasonalDecomposition } from '../hooks/useSeasonalDecomposition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TimeSeriesForecast({ data = [], period = 12 }) {
  const { analyzeTimeSeries, analysisResults } = useTimeSeriesAnalysis();
  const { performSTLDecomposition, decompositionResult } = useSeasonalDecomposition();
  const [showDecomposition, setShowDecomposition] = useState(false);

  React.useEffect(() => {
    if (data.length > 0) {
      analyzeTimeSeries(data, period);
      performSTLDecomposition(data, period);
    }
  }, [data, period, analyzeTimeSeries, performSTLDecomposition]);

  if (!analysisResults || !decompositionResult) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="pt-12 pb-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No data to forecast</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = decompositionResult.original.map((value, idx) => ({
    index: idx,
    original: value,
    trend: decompositionResult.trend[idx] || null,
  }));

  const decompositionData = decompositionResult.original.map((value, idx) => ({
    index: idx,
    original: value,
    trend: decompositionResult.trend[idx] || null,
    seasonal: decompositionResult.seasonal[idx] || 0,
    residual: decompositionResult.residual[idx] || 0,
  }));

  const stationarity = analysisResults.stationarity;

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Time Series Forecast</h2>
      </div>

      {/* Stationarity Status */}
      <Card className={`dark:border-slate-700 ${stationarity.isStationary ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            {stationarity.isStationary ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            )}
            <div>
              <p className="font-medium dark:text-slate-100">
                {stationarity.isStationary ? 'Stationary Series' : 'Non-Stationary Series'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {stationarity.isStationary
                  ? 'Data shows consistent mean and variance'
                  : 'Consider differencing for better predictions'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original + Trend Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base dark:text-slate-100">Original vs Trend</CardTitle>
            <Badge variant="outline">{chartData.length} observations</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="original"
                stroke="#3b82f6"
                name="Original"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#ef4444"
                name="Trend"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Decomposition Chart */}
      {showDecomposition && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">STL Decomposition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={decompositionData}>
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="trend"
                  fill="#ef4444"
                  stroke="#dc2626"
                  name="Trend"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="seasonal"
                  stroke="#10b981"
                  name="Seasonal"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="residual"
                  stroke="#f59e0b"
                  name="Residual"
                  strokeWidth={1}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Series Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Seasonal Strength</p>
              <p className="text-2xl font-bold dark:text-slate-100">
                {(decompositionResult.strength * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Seasonal Period</p>
              <p className="text-2xl font-bold dark:text-slate-100">{decompositionResult.period}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Mean Residual</p>
              <p className="text-lg font-bold dark:text-slate-100">
                {(decompositionResult.residual.reduce((a, b) => a + b, 0) / decompositionResult.residual.length).toFixed(3)}
              </p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Observations</p>
              <p className="text-2xl font-bold dark:text-slate-100">{data.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Button */}
      <button
        onClick={() => setShowDecomposition(!showDecomposition)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
      >
        {showDecomposition ? 'Hide' : 'Show'} Decomposition
      </button>
    </div>
  );
}