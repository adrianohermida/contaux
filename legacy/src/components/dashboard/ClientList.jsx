import React, { useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Trash2, Edit2, Eye } from 'lucide-react';
import { useMultitenantAuthOptimized } from '../auth/useMultitenantAuthOptimized';
import { useCacheStrategy } from '../hooks/useCacheStrategy';
import ClientCardMobile from './ClientCardMobile';

export default function ClientList({ refresh, onEdit, tenantId, onRefresh }) {
  const { workspaceId } = useMultitenantAuthOptimized('internal');
  const { invalidateRelated } = useCacheStrategy();
  const navigate = useNavigate();
  const parentRef = useRef(null);
  const finalTenantId = tenantId || workspaceId;

  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['clients', finalTenantId],
    queryFn: async () => {
      if (!finalTenantId) return [];
      return base44.entities.Client.filter({ 
        tenant_id: finalTenantId,
        status: 'active'
      });
    },
    enabled: !!finalTenantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Virtualização - renderiza apenas itens visíveis
  const virtualizer = useVirtualizer({
    count: clients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  React.useEffect(() => {
    refetch();
  }, [onRefresh, refetch]);
  
  React.useEffect(() => {
    if (refresh) refetch();
  }, [refresh, refetch]);

  const handleDelete = useCallback(async (clientId) => {
    if (!window.confirm('Tem certeza que deseja deletar este cliente?')) return;
    
    try {
      await base44.entities.Client.delete(clientId);
      invalidateRelated('Client', clientId);
      refetch();
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    }
  }, [invalidateRelated, refetch]);

  if (isLoading) {
    return <div className="text-center py-[var(--spacing-2xl)] text-[var(--color-foreground-secondary)]">Carregando clientes...</div>;
  }

  return (
    <div>
      {/* Desktop: Table */}
      <div className="hidden md:block bg-[var(--color-background-primary)] rounded-lg shadow overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead className="bg-[var(--color-background-secondary)] border-b border-[var(--color-border-default)] sticky top-0 z-10">
               <tr>
                 <th className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-left text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Tipo</th>
                 <th className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-left text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Empresa/Nome</th>
                 <th className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-left text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Email</th>
                 <th className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-left text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Telefone</th>
                 <th className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-right text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Ações</th>
              </tr>
            </thead>
            <tbody 
              ref={parentRef}
              className="relative"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const client = clients[virtualRow.index];
                return (
                  <tr 
                    key={client.id} 
                    className="border-b border-[var(--color-border-default)] hover:bg-[var(--color-background-secondary)] absolute top-0 left-0 w-full transition-colors"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)]">
                      <span className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] rounded text-[var(--font-size-xs)] font-medium ${
                        client.client_type === 'pf' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {client.client_type === 'pf' ? 'PF' : 'PJ'}
                      </span>
                    </td>
                    <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)] text-[var(--color-foreground-primary)]">{client.company_name}</td>
                    <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">{client.email}</td>
                    <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">{client.phone}</td>
                    <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-right space-x-[var(--spacing-sm)] flex justify-end">
                      <button onClick={() => navigate(`/clientdetail/${client.id}`)} className="p-[var(--spacing-xs)] hover:bg-[var(--color-background-secondary)] rounded transition-colors" title="Ver detalhes" aria-label="Ver detalhes do cliente">
                        <Eye className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button onClick={() => onEdit(client)} className="p-[var(--spacing-xs)] hover:bg-[var(--color-background-secondary)] rounded transition-colors" title="Editar" aria-label="Editar cliente">
                        <Edit2 className="w-4 h-4 text-[var(--color-interactive-default)]" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="p-[var(--spacing-xs)] hover:bg-[var(--color-background-secondary)] rounded transition-colors" title="Deletar" aria-label="Deletar cliente">
                        <Trash2 className="w-4 h-4 text-[var(--color-error)]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-[var(--spacing-sm)]">
        {clients.length === 0 ? (
          <div className="text-center py-[var(--spacing-2xl)] text-[var(--color-foreground-secondary)]">
            Nenhum cliente cadastrado
          </div>
        ) : (
          clients.map((client) => (
            <ClientCardMobile 
              key={client.id}
              client={client}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}