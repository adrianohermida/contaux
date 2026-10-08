import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const ServiceRow = React.memo(({ service, onEdit, onDelete }) => (
  <tr className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{service.service_name}</td>
    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{service.category}</td>
    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">R$ {service.hourly_rate.toFixed(2)}</td>
    <td className="py-3 px-4">
      <span className={`px-2 py-1 rounded text-xs font-medium ${service.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
        {service.status === 'active' ? 'Ativo' : 'Inativo'}
      </span>
    </td>
    <td className="py-3 px-4 flex gap-2">
      <Button size="icon" variant="ghost" onClick={() => onEdit(service)} className="dark:hover:bg-slate-600" aria-label={`Editar serviço ${service.service_name}`}><Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" /></Button>
      <Button size="icon" variant="ghost" onClick={() => onDelete(service.id)} className="dark:hover:bg-slate-600" aria-label={`Deletar serviço ${service.service_name}`}><Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" aria-hidden="true" /></Button>
    </td>
  </tr>
));

ServiceRow.displayName = 'ServiceRow';

export default function ServicesList({ tenantId, onEdit, onRefresh }) {
  const { data: services = [], isLoading: loading, refetch, error } = useQuery({
    queryKey: ['services', tenantId, onRefresh],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.Service.filter({ tenant_id: tenantId });
    },
    enabled: !!tenantId,
    staleTime: 3 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita. O serviço será deletado permanentemente.')) return;
    try {
      await base44.entities.Service.delete(id);
      toast.success('Serviço deletado com sucesso');
      refetch();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao deletar serviço. Tente novamente.');
    }
  }, [refetch]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center transition-colors">
        <AlertCircle className="w-8 h-8 text-red-400 dark:text-red-500 mx-auto mb-2" aria-hidden="true" />
        <p className="text-red-600 dark:text-red-300 mb-4">Erro ao carregar serviços</p>
        <button onClick={() => refetch()} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline" aria-label="Tentar novamente">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500 dark:text-slate-400" role="status" aria-live="polite">Carregando serviços...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <table className="w-full text-sm" role="table" aria-label="Lista de serviços">
        <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Serviço</th>
            <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Categoria</th>
            <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Taxa Horária</th>
            <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Status</th>
            <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {services.length === 0 ? (
            <tr><td colSpan="5" className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum serviço cadastrado</td></tr>
          ) : (
            services.map(service => (
              <ServiceRow key={service.id} service={service} onEdit={onEdit} onDelete={handleDelete} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}