/**
 * KPI Card Component
 * Display key performance indicator with trend
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({
  title,
  value,
  unit = '',
  trend = null,
  trendLabel = null,
  icon: Icon = null,
  color = 'blue',
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };

  const textClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  const isPositive = trend > 0;

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {value}
            {unit && <span className="text-lg text-slate-500 ml-1">{unit}</span>}
          </p>
        </div>

        {Icon && (
          <div className={`p-3 rounded-lg ${textClasses[color]} bg-white dark:bg-slate-800`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend !== null && (
        <div className="mt-4 flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`text-sm font-medium ${
              isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {Math.abs(trend)}%
            {trendLabel && ` ${trendLabel}`}
          </span>
        </div>
      )}
    </div>
  );
}