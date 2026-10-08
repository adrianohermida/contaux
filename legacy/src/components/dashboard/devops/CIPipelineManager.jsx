import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Loader2, CheckCircle, AlertCircle, Play, Pause, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function CIPipelineManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [newPipeline, setNewPipeline] = useState({
    name: '',
    triggerBranch: 'main',
    autoTest: true,
    autoDeploy: false
  });

  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ['ci-pipelines', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listCIPipelines', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        console.error('Error loading pipelines:', err);
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createPipelineMutation = useMutation({
    mutationFn: async () => {
      if (!newPipeline.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createCIPipeline', {
        workspaceId: workspaceId,
        ...newPipeline
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Pipeline criado');
      setNewPipeline({ name: '', triggerBranch: 'main', autoTest: true, autoDeploy: false });
      queryClient.invalidateQueries({ queryKey: ['ci-pipelines', workspaceId] });
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao criar pipeline');
    }
  });

  const triggerBuildMutation = useMutation({
    mutationFn: async (id) => {
      return base44.functions.invoke('triggerCIBuild', {
        pipelineId: id
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Build iniciado');
      queryClient.invalidateQueries({ queryKey: ['ci-pipelines', workspaceId] });
    }
  });

  return (
    <div className="space-y-6">
      {/* Pipeline Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Novo Pipeline CI/CD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Nome do pipeline"
            value={newPipeline.name}
            onChange={(e) => setNewPipeline({ ...newPipeline, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <select
            value={newPipeline.triggerBranch}
            onChange={(e) => setNewPipeline({ ...newPipeline, triggerBranch: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="main">Main (Produção)</option>
            <option value="develop">Develop (Staging)</option>
            <option value="all">Todas as branches</option>
          </select>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newPipeline.autoTest}
                onChange={(e) => setNewPipeline({ ...newPipeline, autoTest: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Executar testes automaticamente</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newPipeline.autoDeploy}
                onChange={(e) => setNewPipeline({ ...newPipeline, autoDeploy: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Deploy automático se testes passarem</span>
            </label>
          </div>

          <Button
            onClick={() => createPipelineMutation.mutate()}
            disabled={createPipelineMutation.isPending}
            className="w-full gap-2"
          >
            {createPipelineMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                Criar Pipeline
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pipelines List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
          </div>
        ) : pipelines.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhum pipeline configurado</p>
            </CardContent>
          </Card>
        ) : (
          pipelines.map((pipeline) => (
            <Card key={pipeline.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{pipeline.name}</h3>
                      <p className="text-sm text-slate-600">Branch: {pipeline.triggerBranch}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pipeline.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {pipeline.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {pipeline.status === 'running' && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded text-sm space-y-1">
                    <p><strong>Último build:</strong> {pipeline.lastBuildTime ? new Date(pipeline.lastBuildTime).toLocaleDateString('pt-BR') : 'Nunca'}</p>
                    <p><strong>Taxa de sucesso:</strong> {pipeline.successRate}%</p>
                    <p><strong>Testes:</strong> {pipeline.autoTest ? 'Automáticos' : 'Manual'}</p>
                    <p><strong>Deploy:</strong> {pipeline.autoDeploy ? 'Automático' : 'Manual'}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerBuildMutation.mutate(pipeline.id)}
                      disabled={triggerBuildMutation.isPending}
                      className="flex-1 gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Build
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Configurar
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