/**
 * CampaignList Component
 * Display marketing campaigns with filtering, search, and performance metrics
 */

import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/hooks/useTheme';
import { Edit2, Trash2, BarChart3, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CAMPAIGN_TYPES = {
  email: { label: 'Email', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  sms: { label: 'SMS', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  push: { label: 'Push', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  social: { label: 'Social', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' }
};

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function CampaignList({
  workspaceId,
  onEdit,
  onRefresh
}) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Fetch campaigns
  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['campaigns', workspaceId],
    queryFn: () => base44.entities.Campaign.filter({ workspace_id: workspaceId }, '-start_date', 100),
    enabled: !!workspaceId,
    staleTime: 60000
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Campaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      const matchesType = filterType === 'all' || campaign.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [campaigns, searchTerm, filterStatus, filterType]);

  // Virtual scrolling
  const parentRef = React.useRef(null);
  const virtualizer = useVirtualizer({
    count: filteredCampaigns.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 10
  });

  const handleDelete = (id) => {
    if (window.confirm('Deseja deletar esta campanha?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Carregando campanhas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Erro ao carregar campanhas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={theme === 'dark' ? 'dark:bg-slate-800' : ''}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'dark:bg-slate-800 dark:border-slate-600' : 'border-slate-300'}`}
        >
          <option value="all">Todos os Status</option>
          <option value="draft">Rascunho</option>
          <option value="scheduled">Agendada</option>
          <option value="active">Ativa</option>
          <option value="paused">Pausada</option>
          <option value="completed">Completa</option>
          <option value="cancelled">Cancelada</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'dark:bg-slate-800 dark:border-slate-600' : 'border-slate-300'}`}
        >
          <option value="all">Todos os Tipos</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="push">Push</option>
          <option value="social">Social</option>
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className={theme === 'dark' ? 'dark:bg-slate-800' : 'bg-slate-50'}>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left font-semibold">Campanha</th>
              <th className="px-4 py-3 text-left font-semibold">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Enviados</th>
              <th className="px-4 py-3 text-center font-semibold">Taxa Abertura</th>
              <th className="px-4 py-3 text-left font-semibold">Data</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
            {filteredCampaigns.map((campaign) => {
              const openRate = campaign.sent_count > 0
                ? ((campaign.engagement_metrics?.open_count || 0) / campaign.sent_count * 100).toFixed(1)
                : 0;

              return (
                <tr
                  key={campaign.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-4 py-3 font-medium">{campaign.name}</td>
                  <td className="px-4 py-3">
                    <Badge className={CAMPAIGN_TYPES[campaign.type]?.color}>
                      {CAMPAIGN_TYPES[campaign.type]?.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[campaign.status]}>
                      {campaign.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">{campaign.sent_count || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>{openRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {campaign.start_date
                      ? format(new Date(campaign.start_date), 'dd MMM', { locale: ptBR })
                      : '—'
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(campaign)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(campaign.id)}
                        className="h-8 w-8 text-red-600 dark:text-red-400"
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredCampaigns.map((campaign) => {
          const openRate = campaign.sent_count > 0
            ? ((campaign.engagement_metrics?.open_count || 0) / campaign.sent_count * 100).toFixed(1)
            : 0;

          return (
            <div
              key={campaign.id}
              className={`p-4 rounded-lg border ${theme === 'dark' ? 'dark:bg-slate-800 dark:border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge className={CAMPAIGN_TYPES[campaign.type]?.color}>
                      {CAMPAIGN_TYPES[campaign.type]?.label}
                    </Badge>
                    <Badge className={STATUS_COLORS[campaign.status]}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(campaign)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(campaign.id)}
                    className="h-8 w-8 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Enviados</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    {campaign.sent_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Taxa Abertura</p>
                  <p className="font-semibold flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {openRate}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Data</p>
                  <p className="font-semibold text-xs">
                    {campaign.start_date
                      ? format(new Date(campaign.start_date), 'dd MMM', { locale: ptBR })
                      : '—'
                    }
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhuma campanha encontrada</p>
        </div>
      )}
    </div>
  );
}