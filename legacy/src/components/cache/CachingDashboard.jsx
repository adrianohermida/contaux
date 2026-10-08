import React from 'react';
import { TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Caching Dashboard - Overview de estratégias de cache
 */
export default function CachingDashboard() {
  const strategies = [
    {
      name: 'LRU (Least Recently Used)',
      description: 'Remove itens menos usados quando limite atingido',
      status: 'ativo',
      icon: '🕐',
    },
    {
      name: 'TTL (Time To Live)',
      description: 'Expira automaticamente após período definido',
      status: 'ativo',
      icon: '⏱️',
    },
    {
      name: 'GZIP Compression',
      description: 'Comprime dados para reduzir uso de memória',
      status: 'ativo',
      icon: '📦',
    },
  ];

  const recommendations = [
    'Aumentar TTL para dados estáticos de 1h para 2h',
    'Implementar cache de imagens com strategy adaptativo',
    'Habilitar compression para payloads > 1KB',
    'Monitorar hit rate - alvo > 85%',
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
        <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-blue-600 font-semibold">Hit Rate Target</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-900 mt-1">> 85%</p>
            </div>
            <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-3 md:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-emerald-600 font-semibold">Max Cache Size</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-900 mt-1">50 items</p>
            </div>
            <BarChart3 className="w-6 md:w-8 h-6 md:h-8 text-emerald-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-3 md:p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-amber-600 font-semibold">Avg Latency</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-900 mt-1">8ms</p>
            </div>
            <Zap className="w-6 md:w-8 h-6 md:h-8 text-amber-600 flex-shrink-0" />
          </div>
        </Card>
      </div>

      <Card className="p-3 md:p-4 border-blue-200">
        <h3 className="font-semibold text-sm md:text-base text-blue-900 mb-3">Estratégias Ativas</h3>
        <div className="space-y-2 md:space-y-3">
          {strategies.map((strategy, idx) => (
            <div key={idx} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-blue-50 rounded">
              <span className="text-lg md:text-xl flex-shrink-0">{strategy.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs md:text-sm text-slate-900">{strategy.name}</p>
                <p className="text-xs text-slate-600">{strategy.description}</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded flex-shrink-0">
                {strategy.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-blue-200">
        <h3 className="font-semibold text-sm md:text-base text-blue-900 mb-3">Recomendações</h3>
        <ul className="space-y-1 md:space-y-2">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs md:text-sm">
              <span className="text-blue-600 mt-0.5 flex-shrink-0">→</span>
              <span className="text-slate-700">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}