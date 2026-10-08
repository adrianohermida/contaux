import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCacheStrategy } from '../hooks/useCacheStrategy';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

export default function TicketList({ tenantId, onEdit, onRefresh }) {
  const { invalidateRelated } = useCacheStrategy();
  const { isConnected } = useRealtimeSync('Ticket', tenantId);
  const parentRef = useRef(null);

  const { data: tickets = [], isLoading: loading, refetch, error } = useQuery({
   queryKey: ['Ticket-list', tenantId],
   queryFn: async () => {
     if (!tenantId) return [];
     return base44.entities.Ticket.filter({ 
       workspace_id: tenantId 
     });
   },
   enabled: !!tenantId,
   staleTime: 3 * 60 * 1000,
   retry: 2,
   retryDelay: 1000
  });

  // Virtualização
  const virtualizer = useVirtualizer({
    count: tickets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  useEffect(() => {
    if (onRefresh) refetch();
  }, [onRefresh, refetch]);

  const handleDelete = useCallback(async (id) => {
    if (confirm('Tem certeza? Esta ação não pode ser desfeita. O ticket será deletado permanentemente.')) {
      try {
        await base44.entities.Ticket.delete(id);
        toast.success('Ticket deletado com sucesso');
        invalidateRelated('Ticket', id);
        refetch();
      } catch (error) {
        console.error('Erro ao deletar ticket:', error);
        toast.error('Erro ao deletar ticket. Tente novamente.');
      }
    }
  }, [invalidateRelated, refetch]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_client: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100';
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-600">Erro ao carregar tickets</p>
        <button onClick={() => refetch()} className="text-red-500 hover:text-red-700 underline mt-2 text-sm">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando tickets...</div>;

  if (tickets.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600">Nenhum ticket cadastrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Tickets ({tickets.length})</h2>
          {isConnected && <span className="text-xs text-green-600">● Sincronizando em tempo real</span>}
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Nº Ticket</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Título</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Prioridade</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Categoria</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-3 text-right text-sm font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody 
          ref={parentRef}
          className="relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const ticket = tickets[virtualRow.index];
            return (
              <tr 
                key={ticket.id}
                className="hover:bg-slate-50 absolute top-0 left-0 w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <td className="px-6 py-4 text-sm font-medium">{ticket.ticket_number}</td>
                <td className="px-6 py-4 text-sm">{ticket.title}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm capitalize">{ticket.category}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(ticket)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(ticket.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}