import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lightbulb, TrendingUp } from 'lucide-react';

export default function InterventionRecommendationWidget({ workspaceId }) {
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['churn-predictions', workspaceId],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictChurn', {
        workspace_id: workspaceId
      });
      return (response.data?.predictions || []).filter(p => p.risk_level !== 'low').slice(0, 5);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 45,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  const { data: interventions = [], isLoading: loadingInterventions } = useQuery({
    queryKey: ['interventions', workspaceId, predictions],
    queryFn: async () => {
      if (predictions.length === 0) return [];
      
      const results = await Promise.all(
        predictions.map(pred =>
          base44.functions.invoke('generateChurnIntervention', {
            workspace_id: workspaceId,
            contact_id: pred.contact_id,
            churn_risk_score: pred.churn_risk_score,
            risk_level: pred.risk_level
          })
        )
      );
      
      return results.map(r => r.data).filter(Boolean);
    },
    enabled: !!workspaceId && predictions.length > 0,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 45,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  if (isLoading || loadingInterventions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommended Interventions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const totalBudget = interventions.reduce((sum, i) => sum + (i.recommended_budget || 0), 0);
  const avgRetention = interventions.length > 0
    ? Math.round(interventions.reduce((sum, i) => sum + (i.predicted_retention_rate || 0), 0) / interventions.length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Recommended Interventions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">At-Risk</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{predictions.length}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">Avg Retention</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{avgRetention}%</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400">Est. Budget</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">${totalBudget}</p>
            </div>
          </div>

          {/* Intervention List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {interventions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No interventions recommended</p>
            ) : (
              interventions.map((intervention, idx) => {
                const topAction = intervention.interventions?.[0];
                return (
                  <div key={idx} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                            Customer {idx + 1}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            intervention.risk_level === 'critical'
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {intervention.risk_level}
                          </span>
                        </div>
                        {topAction && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {topAction.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            +{intervention.estimated_impact}% impact
                          </span>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded whitespace-nowrap">
                        Execute
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}