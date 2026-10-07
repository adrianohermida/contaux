/**
 * Web Vitals Display Component
 * Shows real-time Core Web Vitals metrics
 */

import React from 'react';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { useWebVitals } from './WebVitalsMonitor';

const STATUS_COLORS = {
  good: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
  fair: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
  poor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
  unknown: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700',
};

const METRIC_LABELS = {
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift',
  TTFB: 'Time to First Byte',
  INP: 'Interaction to Next Paint',
};

const METRIC_UNITS = {
  LCP: 'ms',
  FID: 'ms',
  CLS: '',
  TTFB: 'ms',
  INP: 'ms',
};

export default function WebVitalsDisplay({ compact = false }) {
  const { metrics, getVitalStatus } = useWebVitals();

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        {metrics.LCP && (
          <div className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_COLORS[getVitalStatus('LCP', metrics.LCP)]}`}>
            LCP: {metrics.LCP}ms
          </div>
        )}
        {metrics.CLS && (
          <div className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_COLORS[getVitalStatus('CLS', metrics.CLS)]}`}>
            CLS: {metrics.CLS.toFixed(3)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Core Web Vitals
        </h3>
        <a 
          href="https://web.dev/vitals/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Learn more
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(metrics).map(([key, value]) => {
          if (value === null) return null;

          const status = getVitalStatus(key, value);
          const unit = METRIC_UNITS[key];
          const displayValue = typeof value === 'number' && key === 'CLS' ? value.toFixed(3) : Math.round(value);

          return (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 ${STATUS_COLORS[status]}`}
            >
              <div className="text-xs font-medium mb-1 opacity-75">
                {key}
              </div>
              <div className="text-2xl font-bold mb-1">
                {displayValue}
                <span className="text-sm ml-1">{unit}</span>
              </div>
              <div className="text-xs font-medium capitalize">
                {status === 'good' && '✓ Good'}
                {status === 'fair' && '⚠ Fair'}
                {status === 'poor' && '✗ Poor'}
              </div>
              <div className="text-xs mt-2 opacity-70">
                {METRIC_LABELS[key]}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-400">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            Metrics are tracked in real-time. Refresh the page or interact with the app to update values.
          </div>
        </div>
      </div>
    </div>
  );
}