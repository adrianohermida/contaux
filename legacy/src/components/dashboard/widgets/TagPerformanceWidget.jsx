import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp } from 'lucide-react';

const TAG_COLORS = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export default function TagPerformanceWidget({ workspaceId }) {
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['tags-performance', workspaceId],
    queryFn: () => base44.entities.ContactTag.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments-performance', workspaceId],
    queryFn: () => base44.entities.ContactTagAssignment.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId && tags.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities-performance', workspaceId],
    queryFn: () => base44.entities.ContactActivity.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = tagsLoading || assignmentsLoading;

  const performanceData = useMemo(() => {
    if (tags.length === 0) return [];

    return tags.map(tag => {
      const tagAssignments = assignments.filter(a => a.tag_id === tag.id);
      const contactIds = new Set(tagAssignments.map(a => a.contact_id));
      const tagActivities = activities.filter(a => contactIds.has(a.contact_id));
      
      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        contactCount: tagAssignments.length,
        activityCount: tagActivities.length,
        engagementScore: contactIds.size > 0 ? Math.round((tagActivities.length / contactIds.size)) : 0,
      };
    }).sort((a, b) => b.contactCount - a.contactCount);
  }, [tags, assignments, activities]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance das Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (performanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance das Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-slate-500">
          Nenhuma tag criada ainda
        </CardContent>
      </Card>
    );
  }

  const maxEngagement = Math.max(...performanceData.map(t => t.engagementScore), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-blue-600" />
          Performance das Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performanceData.map((tag) => (
            <div key={tag.id} className="space-y-2">
              {/* Tag badge + metrics */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`}>
                    {tag.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span>{tag.contactCount} contatos</span>
                    <span className="text-slate-400">•</span>
                    <span>{tag.activityCount} atividades</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <TrendingUp className="w-3 h-3" />
                  {tag.engagementScore}
                </div>
              </div>

              {/* Engagement bar */}
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(tag.engagementScore / maxEngagement) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="pt-4 border-t mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total de Tags</p>
              <p className="font-bold text-slate-900 dark:text-slate-100">{performanceData.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Contatos Tagueados</p>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {new Set(assignments.map(a => a.contact_id)).size}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Engagement Médio</p>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {Math.round(
                  performanceData.reduce((sum, t) => sum + t.engagementScore, 0) / performanceData.length
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}