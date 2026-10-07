import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle, AlertCircle, Link2, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeIntegration({ workspaceId }) {
  const queryClient = useQueryClient();
  const [testMode, setTestMode] = useState(true);

  const { data: stripeStatus = {} } = useQuery({
    queryKey: ['stripe-status', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        const response = await base44.functions.invoke('stripeIntegrationStatus', {
          workspaceId: workspaceId
        });
        return response.data || {};
      } catch (err) {
        console.error('Error loading Stripe status:', err);
        return { isConfigured: false, mode: 'test' };
      }
    },
    enabled: !!workspaceId
  });

  const connectStripeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('setupStripeIntegration', {
        workspaceId: workspaceId,
        mode: testMode ? 'test' : 'live'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Stripe conectado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['stripe-status', workspaceId] });
    },
    onError: () => {
      toast.error('Erro ao conectar Stripe');
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('testStripeConnection', {
        workspaceId: workspaceId
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Conexão testada com sucesso!');
      } else {
        toast.error('Falha ao testar conexão');
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Integração Stripe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Status da Conexão</p>
              <p className="text-sm text-slate-600">
                {stripeStatus.isConfigured ? 'Conectado' : 'Não configurado'}
              </p>
            </div>
            {stripeStatus.isConfigured ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
          </div>

          {stripeStatus.isConfigured && (
            <div className="space-y-2 text-sm">
              <p className="text-slate-700"><strong>Modo:</strong> {stripeStatus.mode === 'test' ? 'Teste' : 'Produção'}</p>
              <p className="text-slate-700"><strong>ID da Conta:</strong> {stripeStatus.accountId?.slice(0, 10)}...</p>
              <p className="text-slate-700"><strong>Última verificação:</strong> {new Date(stripeStatus.lastCheck).toLocaleDateString('pt-BR')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Form */}
      {!stripeStatus.isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Stripe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                Você precisará das chaves de API do Stripe. Obtenha em: https://dashboard.stripe.com/apikeys
              </p>
            </div>

            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                checked={testMode}
                onChange={() => setTestMode(true)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <div>
                <p className="font-medium text-slate-900">Modo Teste</p>
                <p className="text-xs text-slate-600">Use para desenvolvimento e testes</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                checked={!testMode}
                onChange={() => setTestMode(false)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <div>
                <p className="font-medium text-slate-900">Modo Produção</p>
                <p className="text-xs text-slate-600">Use para transações reais</p>
              </div>
            </label>

            <Button
              onClick={() => connectStripeMutation.mutate()}
              disabled={connectStripeMutation.isPending}
              className="w-full gap-2"
            >
              {connectStripeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Conectar Stripe
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {stripeStatus.isConfigured && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
            className="gap-2"
          >
            {testConnectionMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Testar Conexão
          </Button>

          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configurar
          </Button>
        </div>
      )}
    </div>
  );
}