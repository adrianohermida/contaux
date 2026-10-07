/**
 * Bundle Analysis Display
 * Shows bundle size metrics and optimization recommendations
 */

import React from 'react';
import { Package, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useBundleAnalyzer } from './BundleAnalyzer';

export default function BundleAnalysisDisplay() {
  const { bundleMetrics, getOptimizationScore, getRecommendations, formatBytes } = useBundleAnalyzer();

  const score = getOptimizationScore();
  const recommendations = getRecommendations();
  const sortedChunks = [...(bundleMetrics.chunks || [])].sort((a, b) => b.size - a.size);

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Bundle Analysis
        </h3>
        <div className={`text-3xl font-bold ${getScoreColor()}`}>
          {score}
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Bundle</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatBytes(bundleMetrics.totalSize)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Main Bundle</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatBytes(bundleMetrics.mainBundle)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Chunks</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {bundleMetrics.chunks.length}
          </div>
        </div>
      </div>

      {/* Top Chunks */}
      {sortedChunks.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Largest Chunks</h4>
          <div className="space-y-2">
            {sortedChunks.slice(0, 5).map((chunk, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                    {chunk.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {chunk.duration ? `${chunk.duration.toFixed(0)}ms` : 'No timing'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatBytes(chunk.size)}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {((chunk.size / bundleMetrics.totalSize) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Optimization Recommendations
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded border-l-4 ${
                  rec.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border-l-red-500 text-red-700 dark:text-red-400'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-500 text-yellow-700 dark:text-yellow-400'
                }`}
              >
                <div className="font-medium text-sm">{rec.title}</div>
                <div className="text-xs mt-1 opacity-90">{rec.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-green-900 dark:text-green-100">Great bundle size!</div>
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your bundle is well optimized. Keep monitoring performance.
            </div>
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>Metrics are calculated from PerformanceResourceTiming API. Reload to refresh values.</div>
      </div>
    </div>
  );
}