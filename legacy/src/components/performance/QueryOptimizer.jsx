import React, { useState } from 'react';
import { Database, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Query Optimizer - Otimiza queries e índices
 * Database indexing, query analysis, caching
 */
export default function QueryOptimizer() {
  const [queries] = useState([
    { id: 1, name: 'getInvoices', execTime: 245, status: 'slow', indexed: false },
    { id: 2, name: 'getPayments', execTime: 89, status: 'good', indexed: true },
    { id: 3, name: 'getClients', execTime: 412, status: 'slow', indexed: false },
    { id: 4, name: 'getTransactions', execTime: 156, status: 'fair', indexed: false },
  ]);

  const avgTime = Math.round(queries.reduce((sum, q) => sum + q.execTime, 0) / queries.length);
  const slowQueries = queries.filter(q => q.status === 'slow').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold">Otimização de Queries</h3>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs text-gray-600">Tempo Médio</p>
            <p className="text-lg font-bold text-blue-600">{avgTime}ms</p>
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <p className="text-xs text-gray-600">Queries Lentas</p>
            <p className="text-lg font-bold text-orange-600">{slowQueries}</p>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <p className="text-xs text-gray-600">Indexadas</p>
            <p className="text-lg font-bold text-green-600">{queries.filter(q => q.indexed).length}</p>
          </div>
        </div>

        <div className="space-y-2">
          {queries.map(query => (
            <div key={query.id} className="p-3 bg-gray-50 rounded space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium font-mono">{query.name}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  query.status === 'slow' ? 'bg-red-100 text-red-700' :
                  query.status === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {query.execTime}ms
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={query.indexed ? 'text-green-600' : 'text-red-600'}>
                  {query.indexed ? '✓ Indexada' : '✗ Sem índice'}
                </span>
                {!query.indexed && <span className="text-blue-600 cursor-pointer">Adicionar índice</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-3 bg-purple-50 border-purple-200 text-xs text-purple-800">
        <p className="font-medium">Recomendações:</p>
        <ul className="mt-1 space-y-1">
          <li>• Adicionar índice para getInvoices (status_id)</li>
          <li>• Adicionar índice para getClients (active)</li>
          <li>• Implementar caching para queries frequentes</li>
        </ul>
      </Card>
    </div>
  );
}