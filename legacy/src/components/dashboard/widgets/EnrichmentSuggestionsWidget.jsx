import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, Zap, Users, TrendingUp } from 'lucide-react';

const SUGGESTION_ICONS = {
  missing_field: Plus,
  cross_sell: Zap,
  upsell: TrendingUp,
  related_contact: Users,
};

const SUGGESTION_COLORS = {
  missing_field: 'text-blue-500',
  cross_sell: 'text-green-500',
  upsell: 'text-amber-500',
  related_contact: 'text-purple-500',
};

const SUGGESTION_LABELS = {
  missing_field: 'Missing Field',
  cross_sell: 'Cross-Sell',
  upsell: 'Upsell',
  related_contact: 'Related Contact',
};

export default function EnrichmentSuggestionsWidget({ workspaceId }) {
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['enrichment-suggestions', workspaceId],
    queryFn: async () => {
      const response = await base44.functions.invoke('suggestEnrichment', { 
        workspace_id: workspaceId 
      });
      return response.data?.suggestions || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5,
  });

  // Group and prioritize suggestions
  const prioritized = suggestions.sort((a, b) => b.impact_score - a.impact_score);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Enrichment Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Enrichment Suggestions <span className="text-sm text-slate-500">({suggestions.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prioritized.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No enrichment needed</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {prioritized.slice(0, 5).map((sugg, idx) => {
              const Icon = SUGGESTION_ICONS[sugg.type] || AlertCircle;
              const label = SUGGESTION_LABELS[sugg.type];
              const color = SUGGESTION_COLORS[sugg.type];
              
              return (
                <div 
                  key={idx}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                        {label}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {sugg.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Impact: <span className="font-semibold">{Math.round(sugg.impact_score * 100)}%</span>
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      variant="ghost"
                      className="text-xs flex-shrink-0 h-7"
                    >
                      Act
                    </Button>
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