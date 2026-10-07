/**
 * useDeviceMetrics Hook
 * Get device metrics like memory, network, and CPU
 */

import { useEffect, useState } from 'react';

export function useDeviceMetrics() {
  const [metrics, setMetrics] = useState({
    memory: null,
    connection: null,
    vCPU: null,
  });

  useEffect(() => {
    // Memory API
    if ('memory' in performance) {
      setMetrics(prev => ({
        ...prev,
        memory: {
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          usedJSHeapSize: performance.memory.usedJSHeapSize,
        },
      }));
    }

    // Network Information API
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setMetrics(prev => ({
        ...prev,
        connection: {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        },
      }));

      const handleConnectionChange = () => {
        setMetrics(prev => ({
          ...prev,
          connection: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
          },
        }));
      };

      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }
  }, []);

  return metrics;
}