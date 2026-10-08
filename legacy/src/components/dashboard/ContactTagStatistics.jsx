import React from 'react';
import { Tag, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const TAG_COLORS = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  orange: 'bg-orange-500',
};

export default function ContactTagStatistics({ workspaceId }) {
  const { data: tags = [] } = useQuery({
    queryKey: ['contact-tags', workspaceId],
    queryFn: async () => {
      return await base44.entities.ContactTag.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['all-contact-tag-assignments', workspaceId],
    queryFn: async () => {
      return await base44.entities.ContactTagAssignment.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', workspaceId],
    queryFn: async () => {
      return await base44.entities.Client.filter({ tenant_id: workspaceId });
    },
    enabled: !!workspaceId,
  });

  const tagStats = tags.map(tag => {
    const count = assignments.filter(a => a.tag_id === tag.id).length;
    const percentage = contacts.length > 0 ? (count / contacts.length) * 100 : 0;
    return { ...tag, count, percentage };
  }).sort((a, b) => b.count - a.count);

  const totalTagged = new Set(assignments.map(a => a.contact_id)).size;
  const untagged = contacts.length - totalTagged;

  if (tags.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Tag className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-center">
            Nenhuma tag criada ainda.<br/>Crie tags para começar a organizar seus contatos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Tags</CardTitle>
            <Tag className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
            <p className="text-xs text-slate-500 mt-1">Tags criadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contatos Organizados</CardTitle>
            <Users className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTagged}</div>
            <p className="text-xs text-slate-500 mt-1">
              {contacts.length > 0 ? `${((totalTagged / contacts.length) * 100).toFixed(1)}% do total` : '0% do total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sem Tags</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{untagged}</div>
            <p className="text-xs text-slate-500 mt-1">Aguardando organização</p>
          </CardContent>
        </Card>
      </div>

      {/* Tag Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tagStats.map((tag) => (
              <div key={tag.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`} />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {tag.count} contato{tag.count !== 1 ? 's' : ''} ({tag.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`}
                    style={{ width: `${Math.min(tag.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Used Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags Mais Usadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tagStats.slice(0, 5).map((tag, index) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-400">#{index + 1}</span>
                  <div className={`w-4 h-4 rounded-full ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`} />
                  <span className="font-medium">{tag.name}</span>
                </div>
                <span className="text-lg font-semibold">{tag.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}