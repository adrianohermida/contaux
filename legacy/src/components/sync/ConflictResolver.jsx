import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Conflict Resolver - Resolve conflitos de sincronização
 */
export default function ConflictResolver() {
  const [conflicts, setConflicts] = useState([
    {
      id: 1,
      entity: 'Invoice #001',
      field: 'amount',
      local: '1500.00',
      remote: '1600.00',
      timestamp: new Date().toISOString(),
      resolved: false,
    },
  ]);

  const resolveConflict = (id, choice) => {
    setConflicts(conflicts.map(c =>
      c.id === id ? { ...c, resolved: true, resolvedWith: choice } : c
    ));
  };

  const getResolutionStrategy = (conflict) => {
    // Last-write-wins
    return 'last-write-wins';
  };

  const unresolvedCount = conflicts.filter(c => !c.resolved).length;

  return (
    <div className="space-y-3 md:space-y-4">
      <Card className="p-3 md:p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <p className="font-semibold text-amber-900">Conflitos Detectados</p>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-amber-900">{unresolvedCount}</p>
        <p className="text-xs text-amber-700">Aguardando resolução</p>
      </Card>

      <div className="space-y-2 md:space-y-3 max-h-96 overflow-y-auto">
        {conflicts.map(conflict => (
          <Card key={conflict.id} className={`p-3 md:p-4 ${conflict.resolved ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-blue-200'}`}>
            <div className="flex items-start justify-between mb-2 md:mb-3 gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{conflict.entity}</p>
                <p className="text-xs text-slate-600">Campo: {conflict.field}</p>
                <p className="text-xs text-slate-500">
                  {new Date(conflict.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {conflict.resolved && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
            </div>

            {!conflict.resolved ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                  <div className="p-2 md:p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700 font-semibold mb-1">Local</p>
                    <p className="font-mono font-bold text-blue-900 break-all text-xs md:text-sm">{conflict.local}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-100 rounded border border-blue-300">
                    <p className="text-xs text-blue-800 font-semibold mb-1">Remoto</p>
                    <p className="font-mono font-bold text-blue-900 break-all text-xs md:text-sm">{conflict.remote}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(conflict.id, 'local')}
                    className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Usar Local
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(conflict.id, 'remote')}
                    className="text-xs border-blue-400 text-blue-800 hover:bg-blue-100"
                  >
                    Usar Remoto
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700">
                  Resolvido: <span className="font-medium capitalize">{conflict.resolvedWith}</span>
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}