import React, { memo, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMultitenantAuthOptimized } from '@/components/auth/useMultitenantAuthOptimized';
import { createPageUrl } from '@/utils';

const VirtualCounterWidget = memo(function VirtualCounterWidget() {
  const { user: authUser } = useMultitenantAuthOptimized('internal');
  
  // Mostrar apenas para admin
  if (!authUser || authUser.role !== 'admin') {
    return null;
  }
  
  const { workspaceId } = useMultitenantAuthOptimized('internal');

  const { data: conversations = [] } = useQuery({
    queryKey: ['virtual-counter-stats', workspaceId],
    queryFn: () => base44.entities.VirtualCounterConversation.filter({
      workspace_id: workspaceId
    }),
    enabled: !!workspaceId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Subscribe para atualizações em tempo real
  React.useEffect(() => {
    const unsubscribe = base44.entities.VirtualCounterConversation.subscribe(() => {
      // React Query invalidará automaticamente
    });
    return unsubscribe;
  }, []);

  const stats = useMemo(() => ({
    active: conversations.filter(c => c.status === 'active').length,
    unread: conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
  }), [conversations]);

  const handleNewConversation = useCallback(async () => {
    try {
      await base44.entities.VirtualCounterConversation.create({
        workspace_id: workspaceId,
        status: 'active',
        started_at: new Date().toISOString()
      });
      window.location.href = createPageUrl('VirtualCounter');
    } catch (error) {
      console.error('Erro:', error);
    }
  }, [workspaceId]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg shadow p-6 border border-blue-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Balcão Virtual</h3>
            <p className="text-sm text-slate-600">Atendimento com IA</p>
          </div>
        </div>
        {stats.unread > 0 && (
          <span className="bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {stats.unread}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white rounded p-3">
          <p className="text-xs text-slate-600">Conversas Ativas</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded p-3">
          <p className="text-xs text-slate-600">Mensagens</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{stats.unread}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleNewConversation}
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nova
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <a href={createPageUrl('VirtualCounter')}>
            Ir para
            <ArrowRight className="w-3 h-3 ml-1" />
          </a>
        </Button>
      </div>
    </div>
  );
});

export default VirtualCounterWidget;