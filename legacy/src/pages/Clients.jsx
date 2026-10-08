import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';
import ProtectedInternalRoute from '../components/auth/ProtectedInternalRoute';
import UnifiedHeader from '../components/shared/UnifiedHeader';
import UnifiedFiltersBar from '../components/shared/UnifiedFiltersBar';
import UnifiedGrid from '../components/shared/UnifiedGrid';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientsModals from '../components/dashboard/clients/ClientsModals';
import UnifiedContactForm from '../components/contact/shared/UnifiedContactForm';
import { useDebounce } from '../components/hooks/useDebounce';
import { usePagination } from '../components/hooks/usePagination';

export default function Clients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspaceId, loading: authLoading } = useGlobalAuth('internal');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', type: 'all' });
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [modalState, setModalState] = useState({
    createClient: false,
    import: false,
    bulkActions: false
  });
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', workspaceId, filters],
    queryFn: async () => {
      const query = {
        workspace_id: workspaceId,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { client_type: filters.type })
      };
      return await base44.entities.Client.filter(query);
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredAndSortedClients = useMemo(() => {
    let result = clients;
    
    if (debouncedSearch) {
      result = result.filter(c =>
        c.company_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    result = result.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return sortOrder === 'desc' ? String(bVal).localeCompare(String(aVal)) : String(aVal).localeCompare(String(bVal));
    });

    return result;
  }, [clients, debouncedSearch, sortBy, sortOrder]);

  const { paginatedItems, currentPage, totalPages, goToPage, hasNext, hasPrev } = 
    usePagination(filteredAndSortedClients, 20);

  const openModal = (name) => setModalState(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModalState(prev => ({ ...prev, [name]: false }));

  return (
    <ProtectedInternalRoute>
      <div className="space-y-[var(--spacing-lg)] pb-20 min-h-screen" role="main" aria-label="Gerenciador de clientes">
        <UnifiedHeader
          title="Clientes"
          filteredCount={filteredAndSortedClients.length}
          totalCount={clients.length}
          itemName="cliente"
          onNewItem={() => openModal('createClient')}
          onImportClick={() => openModal('import')}
        />

        <UnifiedFiltersBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
          additionalFilters={[
            {
              key: 'type',
              label: 'Todos os Tipos',
              options: [
                { value: 'pf', label: 'Pessoa Física' },
                { value: 'pj', label: 'Pessoa Jurídica' }
              ]
            }
          ]}
        />

        <UnifiedGrid
          items={paginatedItems}
          isLoading={isLoading}
          renderItem={(client) => (
            <Card
              key={client.id}
              className="p-[var(--spacing-sm)] sm:p-[var(--spacing-md)] hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] rounded min-h-[120px] flex flex-col justify-between"
              onClick={() => navigate(`/contact/${client.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/contact/${client.id}`);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Ver detalhes do cliente ${client.company_name}`}
            >
              <div className="space-y-[var(--spacing-sm)]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-[var(--spacing-sm)]">
                  <h3 className="font-semibold text-[var(--color-foreground-primary)] line-clamp-2 flex-1">
                    {client.company_name}
                  </h3>
                  <Badge 
                    className={`whitespace-nowrap ${client.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'}`}
                    aria-label={`Status: ${client.status === 'active' ? 'Ativo' : 'Inativo'}`}
                  >
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex items-center gap-[var(--spacing-xs)] text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)] min-h-[28px]">
                  <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${client.email}`} className="hover:text-[var(--color-interactive-hover)] truncate focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] rounded px-1">
                    {client.email}
                  </a>
                </div>

                {client.phone && (
                  <div className="flex items-center gap-[var(--spacing-xs)] text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)] min-h-[28px]">
                    <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="break-all">{client.phone}</span>
                  </div>
                )}

                <div className="flex gap-[var(--spacing-sm)] pt-[var(--spacing-md)] flex-wrap">
                  <Badge 
                    variant="outline" 
                    className="text-[var(--font-size-xs)] bg-[var(--color-background-secondary)] text-[var(--color-foreground-primary)] border-[var(--color-border-default)] min-h-[28px] flex items-center"
                    aria-label={`Tipo: ${client.client_type === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}`}
                  >
                    {client.client_type === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
          emptyMessage="Nenhum cliente encontrado"
          onNewItem={() => openModal('createClient')}
          onImportClick={() => openModal('import')}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNext={hasNext}
          hasPrev={hasPrev}
        />

        <UnifiedContactForm
          open={modalState.createClient}
          onClose={() => closeModal('createClient')}
          workspaceId={workspaceId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['clients', workspaceId] });
            closeModal('createClient');
          }}
          type="simple"
          modalType="dialog"
        />

        <ClientsModals
          showImport={modalState.import}
          onCloseImport={() => closeModal('import')}
          workspaceId={workspaceId}
        />
      </div>
    </ProtectedInternalRoute>
  );
}