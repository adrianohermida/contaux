import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function AccountingCalendarList({ tenantId, onEdit, onRefresh }) {
  const { data: events = [], isLoading: loading, refetch, error } = useQuery({
    queryKey: ['AccountingCalendar-list', tenantId, onRefresh],
    queryFn: async () => {
      if (!tenantId) return [];
      const data = await base44.entities.AccountingCalendar.filter({ tenant_id: tenantId });
      return data.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });

  const handleDelete = useCallback(async (id, title) => {
    if (!confirm(`Tem certeza que deseja deletar o evento "${title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await base44.entities.AccountingCalendar.delete(id);
      toast.success('Evento deletado com sucesso');
      refetch();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao deletar evento. Tente novamente.');
    }
  }, [refetch]);

  const getDaysUntil = useCallback((date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  }, []);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-slate-100';
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      'pending': 'bg-slate-100 text-slate-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100';
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      'pending': 'Pendente',
      'in_progress': 'Em Progresso',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 mb-4">Erro ao carregar eventos</p>
        <button onClick={() => refetch()} className="text-red-500 hover:text-red-700 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando eventos...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left py-3 px-4">Evento</th>
            <th className="text-left py-3 px-4">Data</th>
            <th className="text-left py-3 px-4">Tipo</th>
            <th className="text-left py-3 px-4">Dias Restantes</th>
            <th className="text-left py-3 px-4">Prioridade</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {events.map(event => {
            const daysUntil = getDaysUntil(event.event_date);
            const isUrgent = daysUntil <= 7 && daysUntil > 0;
            const isOverdue = daysUntil <= 0;
            return (
              <tr key={event.id} className={`hover:bg-slate-50 ${isOverdue ? 'bg-red-50' : isUrgent ? 'bg-yellow-50' : ''}`}>
                <td className="py-3 px-4 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {event.event_title}
                </td>
                <td className="py-3 px-4">{new Date(event.event_date).toLocaleDateString('pt-BR')}</td>
                <td className="py-3 px-4 text-xs">
                  <span className="px-2 py-1 bg-slate-100 rounded">{event.event_type}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`font-semibold ${isOverdue ? 'text-red-600' : isUrgent ? 'text-red-600' : 'text-slate-600'}`}>
                    {isOverdue ? `${Math.abs(daysUntil)} dias atrás` : `${daysUntil} dias`}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(event.priority)}`}>
                    {event.priority === 'low' && 'Baixa'}
                    {event.priority === 'medium' && 'Média'}
                    {event.priority === 'high' && 'Alta'}
                    {event.priority === 'urgent' && 'Urgente'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </td>
                <td className="py-3 px-4 flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(event.id, event.event_title)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {events.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum evento agendado</p>
          <p className="text-slate-400 text-sm mt-1">Comece criando um novo evento contábil</p>
        </div>
      )}
    </div>
  );
}