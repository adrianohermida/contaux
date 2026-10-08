import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Sync Queue Manager - Gerencia fila de sincronização
 */
export default function SyncQueueManager() {
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ pending: 0, completed: 0, failed: 0 });

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = () => {
    const stored = localStorage.getItem('syncQueue') || '[]';
    setQueue(JSON.parse(stored));
    updateStats(JSON.parse(stored));
  };

  const updateStats = (items) => {
    setStats({
      pending: items.filter(i => i.status === 'pending').length,
      completed: items.filter(i => i.status === 'completed').length,
      failed: items.filter(i => i.status === 'failed').length,
    });
  };

  const addToQueue = (item) => {
    const newItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...item,
    };
    const updated = [...queue, newItem];
    setQueue(updated);
    localStorage.setItem('syncQueue', JSON.stringify(updated));
    updateStats(updated);
  };

  const processPendingQueue = async () => {
    setSyncing(true);
    const pending = queue.filter(i => i.status === 'pending');
    
    for (const item of pending) {
      try {
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 500));
        updateItemStatus(item.id, 'completed');
      } catch (error) {
        updateItemStatus(item.id, 'failed', error.message);
      }
    }
    setSyncing(false);
  };

  const updateItemStatus = (id, status, error = null) => {
    const updated = queue.map(item =>
      item.id === id
        ? { ...item, status, error, updatedAt: new Date().toISOString() }
        : item
    );
    setQueue(updated);
    localStorage.setItem('syncQueue', JSON.stringify(updated));
    updateStats(updated);
  };

  const clearCompleted = () => {
    const updated = queue.filter(i => i.status !== 'completed');
    setQueue(updated);
    localStorage.setItem('syncQueue', JSON.stringify(updated));
    updateStats(updated);
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <Card className="p-2 md:p-3 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <p className="text-xs text-amber-600 font-semibold">Pendentes</p>
          <p className="text-xl md:text-2xl font-bold text-amber-900">{stats.pending}</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <p className="text-xs text-emerald-600 font-semibold">Concluídos</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-900">{stats.completed}</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <p className="text-xs text-amber-600 font-semibold">Falhas</p>
          <p className="text-xl md:text-2xl font-bold text-amber-900">{stats.failed}</p>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={processPendingQueue}
          disabled={syncing || stats.pending === 0}
          className="flex-1 text-xs"
        >
          <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Processar Fila</span>
          <span className="sm:hidden">Processar</span>
        </Button>
        <Button
          variant="outline"
          onClick={clearCompleted}
          disabled={stats.completed === 0}
          className="text-xs"
        >
          <span className="hidden sm:inline">Limpar Concluídos</span>
          <span className="sm:hidden">Limpar</span>
        </Button>
      </div>

      <div className="space-y-1 md:space-y-2 max-h-96 overflow-y-auto">
        {queue.length === 0 ? (
          <p className="text-center text-slate-500 py-6 md:py-8 text-sm">Fila vazia</p>
        ) : (
          queue.map(item => {
            const statusColors = {
              pending: 'bg-amber-50 border-amber-200',
              completed: 'bg-emerald-50 border-emerald-200',
              failed: 'bg-amber-100 border-amber-300'
            };
            return (
              <Card key={item.id} className={`p-2 md:p-3 ${statusColors[item.status] || 'bg-slate-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-sm text-slate-900">{item.entity}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 capitalize ${
                    item.status === 'completed' ? 'bg-emerald-200 text-emerald-900' :
                    item.status === 'failed' ? 'bg-amber-200 text-amber-900' :
                    'bg-blue-200 text-blue-900'
                  }`}>
                    {item.status}
                  </span>
                </div>
                {item.error && (
                  <p className="text-xs text-amber-700 mt-1 ml-6">{item.error}</p>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}