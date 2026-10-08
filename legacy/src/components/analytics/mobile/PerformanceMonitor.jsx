import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Performance Monitor - Monitora performance do app
 */
export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    cls: 0,
    ttfb: 0,
    fps: 60,
  });

  useEffect(() => {
    measurePerformance();
    measureFPS();
  }, []);

  const measurePerformance = () => {
    if (window.performance && window.performance.timing) {
      const perf = window.performance.timing;
      const ttfb = perf.responseStart - perf.navigationStart;
      const fcp = perf.domContentLoadedEventStart - perf.navigationStart;
      const lcp = perf.loadEventEnd - perf.navigationStart;

      setMetrics((prev) => ({
        ...prev,
        ttfb: Math.round(ttfb),
        fcp: Math.round(fcp),
        lcp: Math.round(lcp),
      }));
    }
  };

  const measureFPS = () => {
    let lastTime = performance.now();
    let frames = 0;

    const calculateFPS = () => {
      const currentTime = performance.now();
      if (currentTime > lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        setMetrics((prev) => ({ ...prev, fps }));
        frames = 0;
        lastTime = currentTime;
      }
      frames++;
      requestAnimationFrame(calculateFPS);
    };

    requestAnimationFrame(calculateFPS);
  };

  const getMetricStatus = (metric, value) => {
    if (metric === 'fps') return value >= 60 ? 'good' : 'poor';
    if (value < 1000) return 'good';
    if (value < 3000) return 'warning';
    return 'poor';
  };

  const metricsList = [
    { label: 'TTFB', value: metrics.ttfb, unit: 'ms' },
    { label: 'FCP', value: metrics.fcp, unit: 'ms' },
    { label: 'LCP', value: metrics.lcp, unit: 'ms' },
    { label: 'FPS', value: metrics.fps, unit: 'fps' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Métricas de Performance</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricsList.map((metric, idx) => {
          const status = getMetricStatus(metric.label.toLowerCase(), metric.value);
          const bgColor =
            status === 'good'
              ? 'bg-green-50'
              : status === 'warning'
              ? 'bg-yellow-50'
              : 'bg-red-50';

          return (
            <div key={idx} className={`${bgColor} p-3 rounded-lg`}>
              <p className="text-xs text-gray-600">{metric.label}</p>
              <p className="text-lg font-bold">
                {metric.value}
                <span className="text-xs ml-1">{metric.unit}</span>
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}