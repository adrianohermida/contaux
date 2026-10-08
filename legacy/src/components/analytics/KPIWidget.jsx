/**
 * KPI Widget
 * Displays key performance indicators with trend analysis
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPIWidget({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  color = 'blue',
  suffix = '',
  isLoading = false,
}) {
  const formatValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (format === 'currency') return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (format === 'percent') return `${Number(val).toFixed(1)}%`;
    return `${Number(val).toLocaleString('pt-BR')}${suffix}`;
  };

  const getTrend = () => {
    if (!previousValue || previousValue === 0) return { direction: 'neutral', pct: 0 };
    const pct = ((value - previousValue) / previousValue) * 100;
    return {
      direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
      pct: Math.abs(pct).toFixed(1),
    };
  };

  const trend = getTrend();

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div
      className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
      role="region"
      aria-label={title}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {formatValue(value)}
        </p>
      )}

      {previousValue !== undefined && !isLoading && (
        <div className="flex items-center gap-1">
          {trend.direction === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500" aria-hidden="true" />
          ) : trend.direction === 'down' ? (
            <TrendingDown className="w-4 h-4 text-red-500" aria-hidden="true" />
          ) : (
            <Minus className="w-4 h-4 text-slate-400" aria-hidden="true" />
          )}
          <span
            className={`text-xs font-medium ${
              trend.direction === 'up'
                ? 'text-green-600 dark:text-green-400'
                : trend.direction === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {trend.pct}% vs. período anterior
          </span>
        </div>
      )}
    </div>
  );
}