import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle, AlertCircle, Link2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleWorkspaceSync({ workspaceId }) {
  const queryClient = useQueryClient();
  const [syncOptions, setSyncOptions] = useState({
    contacts: true,
    calendar: false,
    email: false
  });

  const { data: googleStatus = {} } = useQuery({
    queryKey: ['google-sync-status', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        const response = await base44.functions.invoke('getGoogleSyncStatus', {
          workspaceId: workspaceId
        });
        return response.data || {};
      } catch (err) {
        console.error('Error loading Google sync status:', err);
        return { isConnected: false };
      }
    },
    enabled: !!workspaceId
  });

  const connectGoogleMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('setupGoogleWorkspace', {
        workspaceId: workspaceId,
        scopes: [
          syncOptions.contacts && 'contacts.readonly',
          syncOptions.calendar && 'calendar.readonly',
          syncOptions.email && 'gmail.readonly'
        ].filter(Boolean)
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Google Workspace conectado!');
      queryClient.invalidateQueries({ queryKey: ['google-sync-status', workspaceId] });
    },
    onError: () => {
      toast.error('Erro ao conectar Google Workspace');
    }
  });

  const syncDataMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('syncGoogleData', {
        workspaceId: workspaceId,
        options: syncOptions
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Sincronização concluída: ${data.synced} registros`);
      queryClient.invalidateQueries({ queryKey: ['google-sync-status', workspaceId] });
    },
    onError: () => {
      toast.error('Erro ao sincronizar dados');
    }
  });

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Google Workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Status da Conexão</p>
              <p className="text-sm text-slate-600">
                {googleStatus.isConnected ? 'Conectado' : 'Não configurado'}
              </p>
            </div>
            {googleStatus.isConnected ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
          </div>

          {googleStatus.isConnected && (
            <div className="space-y-2 text-sm">
              <p className="text-slate-700"><strong>Email:</strong> {googleStatus.userEmail}</p>
              <p className="text-slate-700"><strong>Última sincronização:</strong> {new Date(googleStatus.lastSync).toLocaleDateString('pt-BR')}</p>
              <p className="text-slate-700"><strong>Contatos sincronizados:</strong> {googleStatus.contactCount || 0}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Options */}
      <Card>
        <CardHeader>
          <CardTitle>Opções de Sincronização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: 'contacts', label: 'Contatos', desc: 'Sincronizar contatos do Google' },
            { id: 'calendar', label: 'Calendário', desc: 'Sincronizar eventos do calendário' },
            { id: 'email', label: 'Email', desc: 'Ler emails do Gmail' }
          ].map(option => (
            <label key={option.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={syncOptions[option.id]}
                onChange={(e) => setSyncOptions({ ...syncOptions, [option.id]: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <div>
                <p className="font-medium text-slate-900">{option.label}</p>
                <p className="text-xs text-slate-600">{option.desc}</p>
              </div>
            </label>
          ))}

          <Button
            onClick={() => connectGoogleMutation.mutate()}
            disabled={connectGoogleMutation.isPending || googleStatus.isConnected}
            className="w-full gap-2"
          >
            {connectGoogleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Conectar Google
              </>
            )}
          </Button>

          {googleStatus.isConnected && (
            <Button
              variant="outline"
              onClick={() => syncDataMutation.mutate()}
              disabled={syncDataMutation.isPending}
              className="w-full gap-2"
            >
              {syncDataMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sincronizar Agora
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}