import React, { useState, useEffect } from 'react';
import { Smartphone, Zap, Route } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Mobile Analytics - Rastreamento de eventos mobile
 */
export default function MobileAnalytics() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    trackPageView();
    trackUserInteraction();
  }, []);

  const trackPageView = () => {
    const event = {
      type: 'pageView',
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
    };
    logEvent(event);
  };

  const trackUserInteraction = () => {
    const handleClick = () => {
      logEvent({
        type: 'userInteraction',
        action: 'click',
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  };

  const trackPerformance = () => {
    if (window.performance && window.performance.timing) {
      const perf = window.performance.timing;
      const pageLoadTime = perf.loadEventEnd - perf.navigationStart;
      logEvent({
        type: 'performance',
        pageLoadTime,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const logEvent = (event) => {
    setEvents((prev) => [...prev, event].slice(-50));
    // Enviar para backend
    console.log('Event logged:', event);
  };

  useEffect(() => {
    window.addEventListener('load', trackPerformance);
    return () => window.removeEventListener('load', trackPerformance);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <p className="font-medium">Eventos Rastreados</p>
        </div>
        <p className="text-2xl font-bold text-blue-900">{events.length}</p>
        <p className="text-xs text-blue-700">Últimos 50 eventos</p>
      </Card>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.slice().reverse().map((event, idx) => (
          <Card key={idx} className="p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">{event.type}</span>
              <span className="text-xs text-gray-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {event.action && (
              <p className="text-xs text-gray-600">Ação: {event.action}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}