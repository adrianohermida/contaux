/**
 * Contact Activity Timeline
 * Chronological log of all contact changes
 */

import React, { useMemo, useState } from 'react';
import { History, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ActivityTimelineItem from './ActivityTimelineItem';

const ACTIVITY_TYPES = {
  all: 'Todas as Atividades',
  note: 'Notas',
  edit: 'Edições',
  tag_added: 'Tags Adicionadas',
  tag_removed: 'Tags Removidas',
  status_change: 'Mudanças de Status',
  created: 'Criação',
  relationship: 'Relacionamentos',
};

export default function ContactActivityTimeline({ contactId, workspaceId }) {
  const [filter, setFilter] = useState('all');

  // Fetch activities
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['contact-activities', contactId, workspaceId],
    queryFn: async () => {
      const items = await base44.entities.ContactActivity.filter({
        workspace_id: workspaceId,
        contact_id: contactId,
      });
      return items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!contactId && !!workspaceId,
  });

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter(a => a.activity_type === filter);
  }, [activities, filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span className="text-slate-600 dark:text-slate-400">Carregando timeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
        <p className="text-red-600 dark:text-red-400 text-sm">Erro ao carregar atividades</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {filteredActivities.length} atividade{filteredActivities.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 min-h-[40px]" aria-label="Filtrar atividades">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline */}
      {filteredActivities.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
          <History className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhuma atividade registrada ainda
          </p>
        </div>
      ) : (
        <div className="space-y-4 pl-2">
          {filteredActivities.map((activity, index) => (
            <ActivityTimelineItem
              key={activity.id}
              activity={activity}
              isFirst={index === 0}
              isLast={index === filteredActivities.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}