import React, { useEffect, useState } from 'react';
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Monitor de performance do dashboard
 * Exibe métricas de carregamento e otimização
 */
export default function PerformanceMonitor() {
  const metrics = usePerformanceMetrics();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || !metrics.lcp) return null;

  const isOptimized = {
    fcp: metrics.fcp && metrics.fcp < 1800,
    lcp: metrics.lcp && metrics.lcp < 2500,
    cls: metrics.cls < 0.1
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs text-sm z-40">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {isOptimized.fcp ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-yellow-600" />}
          <span>FCP: {metrics.fcp?.toFixed(0)}ms</span>
        </div>
        <div className="flex items-center gap-2">
          {isOptimized.lcp ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-yellow-600" />}
          <span>LCP: {metrics.lcp?.toFixed(0)}ms</span>
        </div>
        <div className="flex items-center gap-2">
          {isOptimized.cls ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-yellow-600" />}
          <span>CLS: {metrics.cls?.toFixed(3)}</span>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="mt-3 w-full text-xs bg-slate-100 hover:bg-slate-200 rounded py-1"
      >
        Fechar
      </button>
    </div>
  );
}