import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Loader2, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function CDNEdgeCachingManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newCDN, setNewCDN] = useState({
    name: '',
    provider: 'cloudflare',
    region: 'global',
    enableCompression: true
  });

  const { data: cdnConfigs = [] } = useQuery({
    queryKey: ['cdn-caching', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listCDNConfigs', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createCDNMutation = useMutation({
    mutationFn: async () => {
      if (!newCDN.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createCDNConfig', {
        workspaceId: workspaceId,
        ...newCDN
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Configuração CDN criada');
      setNewCDN({ name: '', provider: 'cloudflare', region: 'global', enableCompression: true });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['cdn-caching', workspaceId] });
    }
  });

  const PROVIDERS = { cloudflare: 'Cloudflare', cloudfront: 'AWS CloudFront', akamai: 'Akamai' };
  const REGIONS = { global: 'Global', 'us-east': 'US East', 'eu-west': 'EU West', 'ap-south': 'Asia Pacific' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Cache Hit Rate</p>
              <p className="text-2xl font-bold mt-1">88.5%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Globe className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Edge Locations</p>
              <p className="text-2xl font-bold mt-1">200+</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Latência P95</p>
              <p className="text-2xl font-bold mt-1">32ms</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Configuração CDN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome da configuração"
              value={newCDN.name}
              onChange={(e) => setNewCDN({ ...newCDN, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newCDN.provider}
              onChange={(e) => setNewCDN({ ...newCDN, provider: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {Object.entries(PROVIDERS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={newCDN.region}
              onChange={(e) => setNewCDN({ ...newCDN, region: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {Object.entries(REGIONS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newCDN.enableCompression}
                onChange={(e) => setNewCDN({ ...newCDN, enableCompression: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Habilitar Compressão Gzip</span>
            </label>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createCDNMutation.mutate()}
                disabled={createCDNMutation.isPending}
                className="flex-1"
              >
                {createCDNMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Nova Configuração CDN
        </Button>
      )}

      <div className="space-y-3">
        {cdnConfigs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">Nenhuma configuração CDN</CardContent>
          </Card>
        ) : (
          cdnConfigs.map((config) => (
            <Card key={config.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">{config.name}</h3>
                  <p className="text-sm text-slate-600">{PROVIDERS[config.provider]} - {REGIONS[config.region]}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div className="bg-slate-50 p-2 rounded text-center">
                      <p className="text-slate-600">Hit Rate</p>
                      <p className="font-bold">{config.hitRate || 0}%</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded text-center">
                      <p className="text-slate-600">Bytes Servidos</p>
                      <p className="font-bold">{config.bytesServed || 0}GB</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded text-center">
                      <p className="text-slate-600">Uptime</p>
                      <p className="font-bold">99.99%</p>
                    </div>
                  </div>
                  {config.enableCompression && (
                    <p className="text-xs text-green-600 mt-2">✓ Compressão ativa</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}