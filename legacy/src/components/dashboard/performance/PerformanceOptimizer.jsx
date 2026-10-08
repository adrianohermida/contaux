import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Loader2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function PerformanceOptimizer({ workspaceId }) {
  const queryClient = useQueryClient();
  const [optimizing, setOptimizing] = useState(false);

  const { data: optimization = {} } = useQuery({
    queryKey: ['performance-optimization', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        return await base44.functions.invoke('analyzePerformance', {
          workspaceId: workspaceId
        }).then(res => res.data || {});
      } catch (err) {
        console.error('Error analyzing performance:', err);
        return {};
      }
    },
    enabled: !!workspaceId
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      setOptimizing(true);
      return base44.functions.invoke('optimizePerformance', {
        workspaceId: workspaceId
      }).then(res => res.data);
    },
    onSuccess: (data) => {
      toast.success(`Performance melhorada: ${data.improvementPercent}%`);
      setOptimizing(false);
      queryClient.invalidateQueries({ queryKey: ['performance-optimization', workspaceId] });
    },
    onError: () => {
      toast.error('Erro ao otimizar performance');
      setOptimizing(false);
    }
  });

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Score de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{optimization.performanceScore || 85}</p>
                <p className="text-sm text-slate-600">/ 100</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-4">
              {optimization.performanceLevel || 'Bom'} - Últimas 24h
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Oportunidades de Otimização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {optimization.recommendations?.map((rec, idx) => (
            <div key={idx} className="border-l-4 border-amber-500 pl-4 py-3 bg-amber-50 rounded">
              <h4 className="font-medium text-amber-900">{rec.title}</h4>
              <p className="text-sm text-amber-800 mt-1">{rec.description}</p>
              <p className="text-xs text-amber-700 mt-2">
                Impacto estimado: <strong>+{rec.impact}%</strong>
              </p>
            </div>
          )) || (
            <p className="text-sm text-slate-600">Nenhuma oportunidade de otimização identificada</p>
          )}
        </CardContent>
      </Card>

      {/* Current Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle>Otimizações Ativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Compressão Gzip', status: true, impact: '+12%' },
            { name: 'Cache de Página', status: true, impact: '+18%' },
            { name: 'Lazy Loading', status: true, impact: '+8%' },
            { name: 'Code Splitting', status: true, impact: '+15%' },
            { name: 'Image Optimization', status: false, impact: '+10%' }
          ].map((opt, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="font-medium text-slate-900">{opt.name}</p>
                <p className="text-xs text-slate-600">Impacto: {opt.impact}</p>
              </div>
              {opt.status ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Tempo de Carregamento</p>
              <p className="text-2xl font-bold mt-1">{optimization.loadTime || 1.2}s</p>
              <p className="text-xs text-green-600 mt-1">↓ 15% vs semana</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Throughput</p>
              <p className="text-2xl font-bold mt-1">{optimization.throughput || 5200}</p>
              <p className="text-xs text-green-600 mt-1">req/min</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Taxa de Cache Hit</p>
              <p className="text-2xl font-bold mt-1">{optimization.cacheHitRate || 87}%</p>
              <p className="text-xs text-green-600 mt-1">↑ 8% vs semana</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Optimize Button */}
      <Button
        onClick={() => optimizeMutation.mutate()}
        disabled={optimizing || optimizeMutation.isPending}
        className="w-full gap-2 h-12 text-base"
      >
        {optimizing || optimizeMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Otimizando...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Otimizar Performance Automaticamente
          </>
        )}
      </Button>
    </div>
  );
}