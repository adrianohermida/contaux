/**
 * Mobile Performance Monitor
 * Monitor and optimize performance on mobile devices
 */

import React, { useEffect, useState } from 'react';
import { useDeviceMetrics } from './useDeviceMetrics';
import { AlertCircle } from 'lucide-react';

export default function MobilePerformanceMonitor() {
  const metrics = useDeviceMetrics();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show warning if low memory or slow network
    if (
      (metrics.memory && metrics.memory.jsHeapSizeLimit < 100 * 1024 * 1024) ||
      (metrics.connection && metrics.connection.effectiveType === '4g' && metrics.connection.downlink < 1)
    ) {
      setShowWarning(true);
    }
  }, [metrics]);

  // Optimize performance on low-end devices
  useEffect(() => {
    if (metrics.memory && metrics.memory.jsHeapSizeLimit < 100 * 1024 * 1024) {
      // Disable animations on low-memory devices
      document.documentElement.classList.add('reduce-motion');
    }

    if (metrics.connection?.effectiveType === '4g') {
      // Reduce image quality on slow networks
      document.documentElement.classList.add('slow-network');
    }
  }, [metrics]);

  if (!showWarning || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 max-w-xs z-40">
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" aria-hidden="true" />
          <div className="text-xs text-yellow-700 dark:text-yellow-400">
            <p className="font-medium mb-1">Desempenho baixo detectado</p>
            <ul className="space-y-1">
              {metrics.memory && (
                <li>Memória: {(metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(0)}MB</li>
              )}
              {metrics.connection && (
                <li>Conexão: {metrics.connection.effectiveType}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}