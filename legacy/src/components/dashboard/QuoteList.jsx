/**
 * QuoteList Component
 * Display quotes with virtual scrolling, filters, and actions
 */

import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { base44 } from '@/api/base44Client';
import { useSortAndFilter } from '../hooks/useSortAndFilter';
import { getCacheConfig } from '../hooks/useQueryCacheConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
} from 'lucide-react';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function QuoteList({ tenantId, onEdit, onRefresh }) {
  const queryClient = useQueryClient();

  // Fetch quotes (critical data)
  const { data: quotes = [], isLoading, error } = useQuery({
    queryKey: ['quotes', tenantId],
    queryFn: () => base44.entities.Quote.filter({ workspace_id: tenantId }, '-created_date', 100),
    enabled: !!tenantId,
    ...getCacheConfig('critical')
  });

  // Fetch clients (static data)
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', tenantId],
    queryFn: () => base44.entities.Client.filter({ workspace_id: tenantId }, null, 200),
    enabled: !!tenantId,
    ...getCacheConfig('long')
  });

  // Use unified sort/filter hook
  const { 
    data: filteredQuotes, 
    searchText, 
    setFilter: setStatusFilter,
    configureSearch
  } = useSortAndFilter(quotes, 'created_date', 'desc');

  // Configure search on mount
  React.useEffect(() => {
    configureSearch('', ['quote_number']);
  }, []);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (quoteId) => base44.entities.Quote.delete(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', tenantId] });
      onRefresh?.();
    },
  });

  // Virtual scrolling
  const parentRef = React.useRef(null);
  const virtualizer = useVirtualizer({
    count: filteredQuotes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Get client name
  const getClientName = (clientId) => {
    return clients.find(c => c.id === clientId)?.company_name || 'Cliente';
  };

  if (isLoading) {
    return <div className="p-4 text-slate-600 dark:text-slate-400">Carregando cotações...</div>;
  }

  if (error) {
    return (
      <div className="p-4 flex gap-2 text-red-600 dark:text-red-400">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>Erro ao carregar cotações</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 dark:bg-slate-900">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Buscar por nº..."
          value={searchText}
          onChange={(e) => configureSearch(e.target.value, ['quote_number'])}
          className="flex-1 min-w-48 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
        />
        <Select onValueChange={(value) => setStatusFilter('status', value === 'all' ? undefined : value)}>
          <SelectTrigger className="w-40 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="accepted">Aceito</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredQuotes.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          Nenhuma cotação encontrada
        </div>
      ) : (
        <div className="hidden md:block">
          {/* Desktop Table */}
          <div
            ref={parentRef}
            className="h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded"
          >
            <table className="w-full text-sm dark:bg-slate-800">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
                <tr className="border-b border-slate-200 dark:border-slate-600">
                  <th className="p-3 text-left font-semibold dark:text-slate-200">Nº</th>
                  <th className="p-3 text-left font-semibold dark:text-slate-200">Cliente</th>
                  <th className="p-3 text-left font-semibold dark:text-slate-200">Data</th>
                  <th className="p-3 text-right font-semibold dark:text-slate-200">Total</th>
                  <th className="p-3 text-left font-semibold dark:text-slate-200">Status</th>
                  <th className="p-3 text-right font-semibold dark:text-slate-200">Ações</th>
                </tr>
              </thead>
              <tbody style={{ height: `${totalSize}px` }} className="relative">
                {virtualItems.map((virtualItem) => {
                  const quote = filteredQuotes[virtualItem.index];
                  return (
                    <tr
                      key={quote.id}
                      style={{
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className="absolute w-full border-b border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="p-3">{quote.quote_number}</td>
                      <td className="p-3">{getClientName(quote.client_id)}</td>
                      <td className="p-3">{new Date(quote.quote_date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 text-right">{quote.total_amount?.toFixed(2) || '0.00'}</td>
                      <td className="p-3">
                        <Badge className={STATUS_COLORS[quote.status]}>
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit?.(quote)}
                            className="dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {quote.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Deletar cotação?')) {
                                  deleteMutation.mutate(quote.id);
                                }
                              }}
                              className="dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredQuotes.map((quote) => (
          <div
            key={quote.id}
            className="p-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold dark:text-slate-200">{quote.quote_number}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{getClientName(quote.client_id)}</p>
              </div>
              <Badge className={STATUS_COLORS[quote.status]}>{quote.status}</Badge>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(quote.quote_date).toLocaleDateString('pt-BR')}
              </span>
              <span className="font-semibold dark:text-slate-200">{quote.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(quote)}
                className="flex-1 dark:border-slate-600 dark:text-slate-300"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 dark:border-slate-600 dark:text-slate-300"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}