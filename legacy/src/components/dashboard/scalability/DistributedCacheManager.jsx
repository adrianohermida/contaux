import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Zap, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DistributedCacheManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newCache, setNewCache] = useState({
    name: '',
    type: 'redis',
    ttl: 3600,
    maxSize: 1024
  });

  const { data: caches = [] } = useQuery({
    queryKey: ['distributed-cache', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listDistributedCaches', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        console.error('Error loading caches:', err);
        return [];
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 5000
  });

  const createCacheMutation = useMutation({
    mutationFn: async () => {
      if (!newCache.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createDistributedCache', {
        workspaceId: workspaceId,
        ...newCache
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Cache criado');
      setNewCache({ name: '', type: 'redis', ttl: 3600, maxSize: 1024 });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['distributed-cache', workspaceId] });
    }
  });

  const clearCacheMutation = useMutation({
    mutationFn: async (id) => {
      return base44.functions.invoke('clearCache', { cacheId: id }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Cache limpo');
      queryClient.invalidateQueries({ queryKey: ['distributed-cache', workspaceId] });
    }
  });

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Hit Rate</p>
              <p className="text-2xl font-bold mt-1">87.5%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Cache Size</p>
              <p className="text-2xl font-bold mt-1">2.4GB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Evictions</p>
              <p className="text-2xl font-bold mt-1">124</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Cache */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Cache Distribuído</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome do cache"
              value={newCache.name}
              onChange={(e) => setNewCache({ ...newCache, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newCache.type}
              onChange={(e) => setNewCache({ ...newCache, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="redis">Redis</option>
              <option value="memcached">Memcached</option>
              <option value="varnish">Varnish</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">TTL (segundos)</label>
                <input
                  type="number"
                  value={newCache.ttl}
                  onChange={(e) => setNewCache({ ...newCache, ttl: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Tamanho Max (MB)</label>
                <input
                  type="number"
                  value={newCache.maxSize}
                  onChange={(e) => setNewCache({ ...newCache, maxSize: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createCacheMutation.mutate()}
                disabled={createCacheMutation.isPending}
                className="flex-1"
              >
                {createCacheMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Cache
        </Button>
      )}

      {/* Caches List */}
      <div className="space-y-3">
        {caches.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">Nenhum cache configurado</CardContent>
          </Card>
        ) : (
          caches.map((cache) => (
            <Card key={cache.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{cache.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{cache.type}</p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span>TTL: {cache.ttl}s</span>
                      <span>Tamanho: {cache.currentSize}MB / {cache.maxSize}MB</span>
                      <span>Hit Rate: {cache.hitRate || 0}%</span>
                    </div>
                    <div className="mt-2">
                      <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />
                      <span className="text-xs font-medium text-green-600">Ativo</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearCacheMutation.mutate(cache.id)}
                    >
                      Limpar
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}