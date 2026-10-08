import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, Edit3, Tag as TagIcon, ToggleRight, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ACTIVITY_ICONS = {
  note: FileText,
  edit: Edit3,
  tag_added: TagIcon,
  tag_removed: TagIcon,
  status_change: ToggleRight,
  relationship_added: Users,
  created: Plus,
};

const ACTIVITY_COLORS = {
  note: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
  edit: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
  tag_added: 'text-green-600 bg-green-100 dark:bg-green-900',
  tag_removed: 'text-red-600 bg-red-100 dark:bg-red-900',
  status_change: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900',
  relationship_added: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900',
  created: 'text-teal-600 bg-teal-100 dark:bg-teal-900',
};

export default function RecentActivityWidget({ workspaceId }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recent-activities', workspaceId],
    queryFn: async () => {
      const data = await base44.entities.ContactActivity.filter(
        { workspace_id: workspaceId },
        '-created_date',
        10
      );
      return data;
    },
    enabled: !!workspaceId,
    refetchInterval: 30000, // Refresh every 30s
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-mini', workspaceId],
    queryFn: () => base44.entities.Client.filter({ tenant_id: workspaceId }),
    enabled: !!workspaceId && activities.length > 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-blue-600" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.activity_type] || Activity;
            const colorClass = ACTIVITY_COLORS[activity.activity_type] || 'text-slate-600 bg-slate-100';
            const contact = contacts.find(c => c.id === activity.contact_id);
            
            return (
              <Link 
                key={activity.id}
                to={`${createPageUrl('ContactDetails').replace(':contactId', activity.contact_id)}`}
                className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100 font-medium truncate">
                    {contact?.company_name || 'Contato'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_date), { 
                      addSuffix: true,
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </Link>
            );
          })
        )}

        {activities.length > 0 && (
          <Link 
            to={createPageUrl('Contact')}
            className="block text-center text-sm text-blue-600 hover:text-blue-700 pt-3 border-t"
          >
            Ver todos os contatos →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}