import React from 'react';
import { Activity, Zap, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ProfilingDashboard() {
  const metrics = [
    { label: 'FCP', value: '1.2s', status: 'good', target: '< 1.8s' },
    { label: 'LCP', value: '2.5s', status: 'good', target: '< 2.5s' },
    { label: 'CLS', value: '0.05', status: 'excellent', target: '< 0.1' },
    { label: 'TTFB', value: '0.3s', status: 'excellent', target: '< 0.6s' },
    { label: 'Memory', value: '115MB', status: 'warning', target: '< 128MB' },
    { label: 'Bundle', value: '298KB', status: 'good', target: '< 500KB' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return '✓';
      case 'warning':
        return '⚠';
      default:
        return '✗';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="p-4 border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">{metric.label}</p>
              <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(metric.status)}`}>
                {getStatusIcon(metric.status)}
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mb-1">{metric.value}</p>
            <p className="text-xs text-blue-600">Target: {metric.target}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm mb-2 text-blue-900">Recomendações de Otimização</p>
            <ul className="text-sm space-y-1 text-blue-800">
              <li>• Implementar lazy loading para componentes não críticos</li>
              <li>• Monitorar memory leaks com DevTools</li>
              <li>• Aplicar code splitting para reduzir bundle inicial</li>
              <li>• Usar CDN para assets estáticos</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-blue-900 mb-1">Performance Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-blue-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '82%' }} />
              </div>
              <p className="text-lg font-bold text-blue-900">82/100</p>
            </div>
            <p className="text-xs text-blue-800 mt-2">Ótima performance com margem para otimizações</p>
          </div>
        </div>
      </Card>
    </div>
  );
}