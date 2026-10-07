import React, { useState } from 'react';
import { FileText, Edit2, Tag, X, ToggleLeft, UserPlus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ACTIVITY_ICONS = {
  note: FileText,
  edit: Edit2,
  tag_added: Tag,
  tag_removed: X,
  status_change: ToggleLeft,
  created: UserPlus,
};

const ACTIVITY_COLORS = {
  note: 'bg-blue-500',
  edit: 'bg-purple-500',
  tag_added: 'bg-green-500',
  tag_removed: 'bg-red-500',
  status_change: 'bg-yellow-500',
  created: 'bg-indigo-500',
};

const ACTIVITY_LABELS = {
  note: 'Nota',
  edit: 'Edição',
  tag_added: 'Tag Adicionada',
  tag_removed: 'Tag Removida',
  status_change: 'Status Alterado',
  created: 'Criado',
};

export default function ContactActivityTimeline({ contactId, workspaceId }) {
   const [filterType, setFilterType] = useState('all');
   const [page, setPage] = useState(1);
   const ITEMS_PER_PAGE = 25;

   const { data: allActivities = [], isLoading } = useQuery({
     queryKey: ['contact-activities', contactId, workspaceId],
     queryFn: async () => {
       const data = await base44.entities.ContactActivity.filter({ 
         contact_id: contactId,
         workspace_id: workspaceId
       });
       return data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
     },
     enabled: !!contactId && !!workspaceId,
   });

   // Memoized calculations (O(1) filtering with Map)
   const activityTypeMap = React.useMemo(() => {
     const types = new Set();
     allActivities.forEach(a => types.add(a.activity_type));
     return ['all', ...types];
   }, [allActivities]);

   const filteredActivities = React.useMemo(() => {
     if (filterType === 'all') return allActivities.slice(0, page * ITEMS_PER_PAGE);
     return allActivities.filter(a => a.activity_type === filterType).slice(0, page * ITEMS_PER_PAGE);
   }, [allActivities, filterType, page]);

   const hasMore = allActivities.length > filteredActivities.length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
         {activityTypeMap.map((type) => (
           <Button
            key={type}
            onClick={() => setFilterType(type)}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            {type === 'all' ? (
              <>
                <Filter className="w-4 h-4" />
                Todas
              </>
            ) : (
              <>
                {React.createElement(ACTIVITY_ICONS[type], { className: 'w-4 h-4' })}
                {ACTIVITY_LABELS[type]}
              </>
            )}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center text-slate-500 py-8">Carregando atividades...</p>
      ) : filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Nenhuma atividade encontrada
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full mt-4 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Carregar mais atividades ({allActivities.length - filteredActivities.length} restantes)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }) {
  const Icon = ACTIVITY_ICONS[activity.activity_type];
  const color = ACTIVITY_COLORS[activity.activity_type];
  const timeAgo = formatDistanceToNow(new Date(activity.created_date), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className="relative pl-16">
      {/* Timeline dot */}
      <div className={`absolute left-4 top-2 w-4 h-4 rounded-full ${color} ring-4 ring-white dark:ring-slate-900`} />

      <Card className="ml-2">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {activity.description}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{activity.created_by}</span>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                  <pre className="text-slate-600 dark:text-slate-400">
                    {JSON.stringify(activity.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}