/**
 * SeasonalAnalysis Component
 * Display seasonal patterns and anomalies
 */

import React, { useState } from 'react';
import { useSeasonalDecomposition } from '../hooks/useSeasonalDecomposition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';

export default function SeasonalAnalysis({ data = [] }) {
  const {
    getSeasonalIndices,
    performSTLDecomposition,
    detectSeasonalAnomalies,
    decompositionResult,
  } = useSeasonalDecomposition();
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  React.useEffect(() => {
    if (data.length > 0) {
      performSTLDecomposition(data);
    }
  }, [data, performSTLDecomposition]);

  if (!decompositionResult || data.length === 0) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="pt-12 pb-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No data for seasonal analysis</p>
        </CardContent>
      </Card>
    );
  }

  const seasonalIndices = getSeasonalIndices(data);
  const anomalies = detectSeasonalAnomalies(data, 2);

  // Prepare seasonal pattern chart data
  const seasonalChartData = seasonalIndices.map((index, i) => ({
    period: i + 1,
    index: index * 100,
  }));

  // Prepare anomaly data
  const anomalyChartData = decompositionResult.residual.map((value, idx) => ({
    index: idx,
    residual: value,
    isAnomaly: anomalies.some((a) => a.index === idx),
  }));

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Seasonal Analysis</h2>
        {anomalies.length > 0 && (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            {anomalies.length} Anomalies
          </Badge>
        )}
      </div>

      {/* Seasonal Indices */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">
            Seasonal Indices (Period {decompositionResult.period})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seasonalChartData}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="index" fill="#10b981" name="Seasonal Index" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Residual Anomalies */}
      {anomalies.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Detected Anomalies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {anomalies.slice(0, 5).map((anomaly, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAnomaly(anomaly)}
                className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">
                      Anomaly at index {anomaly.index}
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-300">
                      Z-Score: {anomaly.zScore.toFixed(2)} | Value: {anomaly.value.toFixed(3)}
                    </p>
                  </div>
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Residual Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Residuals with Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={anomalyChartData}>
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="residual"
                stroke="#3b82f6"
                name="Residual"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isAnomaly) {
                    return (
                      <circle cx={cx} cy={cy} r={5} fill="#ef4444" key={`anomaly-${payload.index}`} />
                    );
                  }
                  return <circle cx={cx} cy={cy} r={2} fill="#3b82f6" key={`point-${payload.index}`} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Seasonal Statistics</CardTitle>
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
              <p className="text-xs text-slate-600 dark:text-slate-400">Period</p>
              <p className="text-2xl font-bold dark:text-slate-100">{decompositionResult.period}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Anomalies Found</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{anomalies.length}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Data Points</p>
              <p className="text-2xl font-bold dark:text-slate-100">{data.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}