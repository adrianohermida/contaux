import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMultitenantAuthOptimized } from '../components/auth/useMultitenantAuthOptimized';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, AlertCircle, RefreshCw, User, Globe } from 'lucide-react';

export default function AuditLogs() {
  const { workspaceId, loading: authLoading } = useMultitenantAuthOptimized('internal');
  const [filterAction, setFilterAction] = useState('all');

  const { data: logs = [], isLoading, refetch, error } = useQuery({
    queryKey: ['AuditLog-list', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.AuditLog.filter(
        { tenant_id: workspaceId },
        '-created_date',
        500
      );
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const getActionBadge = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      view: 'bg-purple-100 text-purple-800',
      export: 'bg-amber-100 text-amber-800',
      login: 'bg-indigo-100 text-indigo-800',
      logout: 'bg-slate-100 text-slate-800'
    };
    return colors[action] || 'bg-slate-100 text-slate-800';
  };

  const filteredLogs = useMemo(() => {
    return filterAction === 'all' ? logs : logs.filter(log => log.action === filterAction);
  }, [logs, filterAction]);

  const stats = useMemo(() => ({
    total: logs.length,
    creates: logs.filter(l => l.action === 'create').length,
    updates: logs.filter(l => l.action === 'update').length,
    deletes: logs.filter(l => l.action === 'delete').length,
    users: [...new Set(logs.map(l => l.user_email))].length
  }), [logs]);

  const downloadLogs = () => {
    const csv = [
      ['Timestamp', 'Usuário', 'Ação', 'Entidade', 'Detalhes', 'IP'].join(','),
      ...filteredLogs.map(log => [
        log.created_date,
        log.user_email,
        log.action,
        log.entity_type,
        log.status,
        log.ip_address
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Logs exportados com sucesso');
  };

  if (authLoading) {
     return <div className="flex items-center justify-center h-96 text-[var(--color-foreground-secondary)]">Carregando...</div>;
   }

   if (error && !logs.length) {
     return (
       <div className="space-y-[var(--spacing-lg)] p-[var(--spacing-lg)]">
         <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Log de Auditoria</h1>
         <div className="bg-red-50 border border-red-200 rounded-lg p-[var(--spacing-2xl)] text-center">
           <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-[var(--spacing-md)]" />
           <p className="text-red-600 mb-[var(--spacing-md)]">Erro ao carregar logs</p>
           <Button onClick={() => refetch()} className="gap-[var(--spacing-sm)]">
             <RefreshCw className="w-4 h-4" />
             Tentar Novamente
           </Button>
         </div>
       </div>
     );
   }

   return (
     <div className="space-y-[var(--spacing-lg)] p-[var(--spacing-lg)]">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Log de Auditoria</h1>
           <p className="text-[var(--color-foreground-secondary)]">Registre todas as ações e alterações do sistema</p>
         </div>
        <div className="flex gap-[var(--spacing-sm)]">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm" 
            className="gap-[var(--spacing-sm)]"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={downloadLogs} 
            variant="outline" 
            size="sm" 
            className="gap-[var(--spacing-sm)]"
            disabled={logs.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['all', 'create', 'update', 'delete', 'view', 'export'].map(action => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-4 py-2 rounded-lg transition ${
                  filterAction === action
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {action === 'all' ? 'Todos' : action.charAt(0).toUpperCase() + action.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && !logs.length && (
        <div className="text-center py-12 text-[var(--color-foreground-secondary)]">Carregando logs...</div>
      )}

      {/* Logs */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-[var(--spacing-md)]" />
          <p className="text-[var(--color-foreground-secondary)] font-medium">Nenhum log encontrado</p>
          <p className="text-[var(--color-foreground-secondary)] text-sm mt-[var(--spacing-xs)]">Tente ajustar seus filtros de busca</p>
        </div>
      ) : (
        <div className="space-y-[var(--spacing-sm)]">
          {filteredLogs.map(log => (
            <Card key={log.id}>
              <CardContent className="p-[var(--spacing-md)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium">{log.entity_type}</p>
                        <p className="text-sm text-slate-600">{new Date(log.created_date).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{log.status}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <User className="w-3 h-3" aria-hidden="true" />
                      <span>{log.user_email}</span>
                      {log.ip_address && (
                        <>
                          <Globe className="w-3 h-3 ml-1" aria-hidden="true" />
                          <span>{log.ip_address}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge className={getActionBadge(log.action)}>
                    {log.action.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-[var(--spacing-md)]">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-slate-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.creates}</p>
            <p className="text-xs text-slate-600">Criações</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.updates}</p>
            <p className="text-xs text-slate-600">Atualizações</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.deletes}</p>
            <p className="text-xs text-slate-600">Deleções</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.users}</p>
            <p className="text-xs text-slate-600">Usuários</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}