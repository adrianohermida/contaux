import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Trophy } from 'lucide-react';

export default function PointsTrackerWidget({ workspaceId }) {
  const { data: pointsData = [], isLoading } = useQuery({
    queryKey: ['customer-points', workspaceId],
    queryFn: async () => {
      const response = await base44.asServiceRole.entities.CustomerPoints.filter({
        workspace_id: workspaceId,
        is_active: true
      });
      return (response || []).slice(0, 8);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 10
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Points Holders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topMembers = [...pointsData].sort((a, b) => b.current_points - a.current_points).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Top Points Holders
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {pointsData.length} active members
        </p>
      </CardHeader>
      <CardContent>
        {topMembers.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No members yet</p>
        ) : (
          <div className="space-y-2">
            {topMembers.map((member, idx) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 w-6">#{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Customer</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.tier || 'Standard'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{member.current_points}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}