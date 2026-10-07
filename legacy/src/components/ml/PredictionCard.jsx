/**
 * PredictionCard Component
 * Display AI predictions with confidence intervals
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export default function PredictionCard({ prediction, onAction }) {
  const Icon = TREND_ICONS[prediction.trend] || Minus;

  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      case 'stable':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getConfidenceBadgeColor = () => {
    if (prediction.confidence >= 85) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (prediction.confidence >= 70) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  };

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${getTrendColor()} bg-slate-100 dark:bg-slate-700`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base dark:text-slate-100">{prediction.name}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Based on {prediction.data_points} data points
              </p>
            </div>
          </div>
          <Badge className={getConfidenceBadgeColor()}>
            {Math.round(prediction.confidence)}% Confidence
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trend Label */}
        <div className="text-sm">
          <span className="text-slate-600 dark:text-slate-400">Trend: </span>
          <span className={`font-medium capitalize ${getTrendColor()}`}>
            {prediction.trend === 'up'
              ? '📈 Upward'
              : prediction.trend === 'down'
              ? '📉 Downward'
              : '➡️ Stable'}
          </span>
        </div>

        {/* Predictions Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            5-Period Forecast
          </p>
          <div className="grid grid-cols-5 gap-1">
            {prediction.predictions.slice(0, 5).map((pred, idx) => (
              <div
                key={idx}
                className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-center"
              >
                <p className="text-xs text-slate-600 dark:text-slate-400">P{pred.period}</p>
                <p className="text-sm font-bold dark:text-slate-100">
                  {typeof pred.value === 'number' ? pred.value.toFixed(1) : pred.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Interval */}
        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 dark:text-slate-400">Confidence Interval</span>
            <span className="font-medium dark:text-slate-100">95%</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Lower Bound:</span>
              <span className="font-medium dark:text-slate-100">
                {prediction.predictions[0]?.lower_bound?.toFixed(2) || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Upper Bound:</span>
              <span className="font-medium dark:text-slate-100">
                {prediction.predictions[0]?.upper_bound?.toFixed(2) || '—'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}