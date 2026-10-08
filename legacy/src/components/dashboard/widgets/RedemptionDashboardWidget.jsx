import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Gift, CheckCircle, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  approved: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  used: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  expired: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
};

export default function RedemptionDashboardWidget({ workspaceId }) {
  const { data: redemptions = [], isLoading } = useQuery({
    queryKey: ['reward-redemptions', workspaceId],
    queryFn: async () => {
      const response = await base44.asServiceRole.entities.RewardRedemption.filter({
        workspace_id: workspaceId
      });
      return (response || []).slice(0, 10);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 10
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Recent Redemptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pending = redemptions.filter(r => r.status === 'pending').length;
  const used = redemptions.filter(r => r.status === 'used').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Redemptions
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {pending} pending • {used} used
        </p>
      </CardHeader>
      <CardContent>
        {redemptions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No redemptions yet</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {redemptions.map(redemption => (
              <div key={redemption.id} className={`p-3 rounded-lg border ${STATUS_COLORS[redemption.status]}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {redemption.points_redeemed} pts → ${redemption.reward_value}
                    </p>
                    <p className="text-xs opacity-75 mt-0.5">{redemption.reward_type}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-current bg-opacity-20 rounded">
                    {redemption.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}