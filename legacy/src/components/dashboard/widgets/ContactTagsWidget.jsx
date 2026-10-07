import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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

export default function ContactTagsWidget({ workspaceId }) {
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['contact-tags', workspaceId],
    queryFn: () => base44.entities.ContactTag.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['contact-tag-assignments', workspaceId],
    queryFn: () => base44.entities.ContactTagAssignment.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = tagsLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Distribuição de Tags
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

  // Count assignments per tag
  const tagCounts = tags.map(tag => ({
    ...tag,
    count: assignments.filter(a => a.tag_id === tag.id).length,
  })).sort((a, b) => b.count - a.count);

  const topTags = tagCounts.slice(0, 5);
  const totalAssignments = assignments.length;

  return (
    <Link to={createPageUrl('Contact')}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="w-5 h-5 text-blue-600" />
            Top 5 Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topTags.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma tag criada ainda</p>
            </div>
          ) : (
            <>
              {topTags.map((tag) => {
                const percentage = totalAssignments > 0 
                  ? Math.round((tag.count / totalAssignments) * 100)
                  : 0;
                
                return (
                  <div key={tag.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`}>
                          {tag.name}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {tag.count} {tag.count === 1 ? 'contato' : 'contatos'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="pt-3 border-t text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Total: {tags.length} tags • {totalAssignments} atribuições
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}