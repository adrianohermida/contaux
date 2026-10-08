/**
 * SalesOpportunityList Component
 * Display sales opportunities with pipeline stages, lead scores, and actions
 */

import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, TrendingUp, Zap, AlertCircle } from 'lucide-react';

const PIPELINE_STAGES = [
  { value: 'prospect', label: 'Prospecção', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  { value: 'qualified', label: 'Qualificado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'proposal', label: 'Proposta', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'negotiation', label: 'Negociação', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'won', label: 'Ganho', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

const SCORE_COLORS = {
  hot: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warm: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  cold: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const getScoreCategory = (score) => {
  if (score >= 70) return { label: 'Quente', key: 'hot' };
  if (score >= 30) return { label: 'Morna', key: 'warm' };
  return { label: 'Fria', key: 'cold' };
};

export default function SalesOpportunityList({ workspaceId, onEdit, onRefresh }) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState({
    search: '',
    stage: 'all',
    scoreCategory: 'all',
  });

  // Fetch opportunities
  const { data: opportunities = [], isLoading, error } = useQuery({
    queryKey: ['opportunities', workspaceId, filters],
    queryFn: () => {
      const query = { workspace_id: workspaceId };
      if (filters.stage !== 'all') {
        query.pipeline_stage = filters.stage;
      }
      return base44.entities.SalesOpportunity.filter(query, '-lead_score', 100);
    },
    enabled: !!workspaceId,
    staleTime: 60000,
  });

  // Fetch contacts for name mapping
  const { data: contacts = [] } = useQuery({
    queryKey: ['clients', workspaceId],
    queryFn: () => base44.entities.Client.filter({ tenant_id: workspaceId }, null, 200),
    enabled: !!workspaceId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (opportunityId) => base44.entities.SalesOpportunity.delete(opportunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', workspaceId] });
      onRefresh?.();
    },
  });

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const contact = contacts.find(c => c.id === opp.contact_id);
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        opp.opportunity_name?.toLowerCase().includes(searchLower) ||
        contact?.company_name?.toLowerCase().includes(searchLower);

      const scoreCategory = getScoreCategory(opp.lead_score);
      const matchesScore =
        filters.scoreCategory === 'all' || scoreCategory.key === filters.scoreCategory;

      return matchesSearch && matchesScore;
    });
  }, [opportunities, contacts, filters]);

  // Virtual scrolling
  const parentRef = React.useRef(null);
  const virtualizer = useVirtualizer({
    count: filteredOpportunities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Get contact name
  const getContactName = (contactId) => {
    return contacts.find(c => c.id === contactId)?.company_name || 'Cliente';
  };

  // Get stage color
  const getStageColor = (stage) => {
    const found = PIPELINE_STAGES.find(s => s.value === stage);
    return found?.color || '';
  };

  // Get stage label
  const getStagelabel = (stage) => {
    const found = PIPELINE_STAGES.find(s => s.value === stage);
    return found?.label || stage;
  };

  if (isLoading) {
    return <div className="p-4 text-slate-600 dark:text-slate-400">Carregando oportunidades...</div>;
  }

  if (error) {
    return (
      <div className="p-4 flex gap-2 text-red-600 dark:text-red-400">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>Erro ao carregar oportunidades</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 dark:bg-slate-900">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Buscar por nome ou cliente..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 min-w-48 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
        />
        <Select value={filters.stage} onValueChange={(value) => setFilters({ ...filters, stage: value })}>
          <SelectTrigger className="w-40 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
            <SelectItem value="all">Todos Estágios</SelectItem>
            {PIPELINE_STAGES.map(stage => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.scoreCategory} onValueChange={(value) => setFilters({ ...filters, scoreCategory: value })}>
          <SelectTrigger className="w-40 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
            <SelectItem value="all">Todos Scores</SelectItem>
            <SelectItem value="hot">Quente (70+)</SelectItem>
            <SelectItem value="warm">Morna (30-70)</SelectItem>
            <SelectItem value="cold">Fria (&lt;30)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredOpportunities.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          Nenhuma oportunidade encontrada
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
                  <th className="p-3 text-left font-semibold dark:text-slate-200">Nome</th>
                  <th className="p-3 text-left font-semibold dark:text-slate-200">Cliente</th>
                  <th className="p-3 text-left font-semibold dark:text-slate-200">Estágio</th>
                  <th className="p-3 text-right font-semibold dark:text-slate-200">Valor</th>
                  <th className="p-3 text-center font-semibold dark:text-slate-200">Score</th>
                  <th className="p-3 text-right font-semibold dark:text-slate-200">Ações</th>
                </tr>
              </thead>
              <tbody style={{ height: `${totalSize}px` }} className="relative">
                {virtualItems.map((virtualItem) => {
                  const opp = filteredOpportunities[virtualItem.index];
                  const scoreCategory = getScoreCategory(opp.lead_score);
                  return (
                    <tr
                      key={opp.id}
                      style={{
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className="absolute w-full border-b border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="p-3 font-medium">{opp.opportunity_name}</td>
                      <td className="p-3">{getContactName(opp.contact_id)}</td>
                      <td className="p-3">
                        <Badge className={getStageColor(opp.pipeline_stage)}>
                          {getStagelabel(opp.pipeline_stage)}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">{opp.deal_value?.toFixed(2) || '0.00'}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <Badge className={SCORE_COLORS[scoreCategory.key]}>
                            {opp.lead_score}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit?.(opp)}
                            className="dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('Deletar oportunidade?')) {
                                deleteMutation.mutate(opp.id);
                              }
                            }}
                            className="dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
        {filteredOpportunities.map((opp) => {
          const scoreCategory = getScoreCategory(opp.lead_score);
          return (
            <div
              key={opp.id}
              className="p-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold dark:text-slate-200">{opp.opportunity_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{getContactName(opp.contact_id)}</p>
                </div>
                <Badge className={SCORE_COLORS[scoreCategory.key]}>
                  {opp.lead_score}
                </Badge>
              </div>
              <div className="flex justify-between items-center mb-3">
                <Badge className={getStageColor(opp.pipeline_stage)}>
                  {getStagelabel(opp.pipeline_stage)}
                </Badge>
                <span className="font-semibold dark:text-slate-200">{opp.deal_value?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit?.(opp)}
                  className="flex-1 dark:border-slate-600 dark:text-slate-300"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}