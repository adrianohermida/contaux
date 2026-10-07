import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, FileText, AlertCircle, TrendingUp, Star } from 'lucide-react';

const ACTION_ICONS = {
  call: Phone,
  email: Mail,
  proposal: FileText,
  meeting: AlertCircle,
};

const ACTION_COLORS = {
  call: 'text-red-500',
  email: 'text-blue-500',
  proposal: 'text-purple-500',
  meeting: 'text-yellow-500',
};

export default function AIInsightsWidget({ workspaceId }) {
  const [filterPriority, setFilterPriority] = useState('all');

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['ai-insights', workspaceId],
    queryFn: async () => {
      const response = await base44.functions.invoke('recommendNextActions', { 
        workspace_id: workspaceId 
      });
      return response.data?.recommendations || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5,
  });

  const filteredRecommendations = filterPriority === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.priority >= parseInt(filterPriority));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
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
            <TrendingUp className="w-5 h-5" />
            AI Insights
          </CardTitle>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-sm px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
          >
            <option value="all">All Priority</option>
            <option value="5">High (5⭐)</option>
            <option value="4">High+ (4⭐)</option>
            <option value="3">Medium (3⭐)</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRecommendations.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recommendations at this time</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredRecommendations.slice(0, 6).map((rec) => {
              const Icon = ACTION_ICONS[rec.action_type] || AlertCircle;
              return (
                <div 
                  key={rec.opportunity_id}
                  className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Icon className={`w-4 h-4 mt-1 flex-shrink-0 ${ACTION_COLORS[rec.action_type]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                          {rec.lead_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {rec.reason}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Due: {rec.due_date}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="flex gap-0.5">
                        {[...Array(rec.priority)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        // Copy suggested content to clipboard
                        navigator.clipboard.writeText(rec.suggested_content);
                      }}
                    >
                      Copy Text
                    </Button>
                    <span className="text-xs text-slate-500 dark:text-slate-400 self-center">
                      {Math.round(rec.success_probability * 100)}% success
                    </span>
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