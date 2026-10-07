import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Pause, Play, MoreVertical, Plus } from 'lucide-react';

const STATUS_COLORS = {
  draft: 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300',
  active: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  paused: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  completed: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
};

export default function CampaignManagerWidget({ workspaceId }) {
  const [expandedId, setExpandedId] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', workspaceId],
    queryFn: async () => {
      const response = await base44.asServiceRole.entities.Campaign.filter({
        workspace_id: workspaceId
      });
      return response || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Campaign Manager
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Campaign Manager
          </CardTitle>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {campaigns.length} campaigns
        </p>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No campaigns yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {campaigns.map(campaign => {
              const openRate = campaign.sent_count > 0 ? ((campaign.open_count / campaign.sent_count) * 100).toFixed(1) : 0;
              const clickRate = campaign.sent_count > 0 ? ((campaign.click_count / campaign.sent_count) * 100).toFixed(1) : 0;
              
              return (
                <div key={campaign.id} className="p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                          {campaign.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[campaign.status]}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Sent: {campaign.sent_count} • Open: {openRate}% • Click: {clickRate}%
                      </p>
                    </div>
                    <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}