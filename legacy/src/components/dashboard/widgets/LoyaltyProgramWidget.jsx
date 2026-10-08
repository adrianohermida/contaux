import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, Users, Zap } from 'lucide-react';

export default function LoyaltyProgramWidget({ workspaceId }) {
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['loyalty-programs', workspaceId],
    queryFn: async () => {
      const response = await base44.asServiceRole.entities.LoyaltyProgram.filter({
        workspace_id: workspaceId,
        status: 'active'
      });
      return response || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 10
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Loyalty Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Loyalty Programs
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {programs.length} active program{programs.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent>
        {programs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No active programs</p>
        ) : (
          <div className="space-y-4">
            {programs.map(program => (
              <div key={program.id} className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {program.name}
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Members</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {program.member_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Issued Points</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {program.total_points_issued || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Redeemed</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {program.total_points_redeemed || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}