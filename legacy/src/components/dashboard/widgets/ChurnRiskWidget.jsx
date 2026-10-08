import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, Phone, Gift, ChevronDown } from 'lucide-react';

const getRiskColor = (score) => {
  if (score >= 70) return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' };
  if (score >= 50) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' };
  if (score >= 30) return { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-400', badge: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' };
  return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
};

export default function ChurnRiskWidget({ workspaceId }) {
  const [expandedId, setExpandedId] = useState(null);

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['churn-predictions', workspaceId],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictChurn', {
        workspace_id: workspaceId
      });
      return (response.data?.predictions || []).filter(p => p.risk_level !== 'low').sort((a, b) => b.churn_risk_score - a.churn_risk_score).slice(0, 8);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 45,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Churn Risk Analysis
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

  const critical = predictions.filter(p => p.risk_level === 'critical').length;
  const high = predictions.filter(p => p.risk_level === 'high').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Churn Risk Analysis
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {critical} critical • {high} high risk
        </p>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No at-risk customers</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {predictions.map(pred => {
              const colors = getRiskColor(pred.churn_risk_score);
              
              return (
                <div key={pred.contact_id} className={`p-3 border rounded-lg ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Customer</p>
                        <span className={`text-xs px-2 py-1 rounded ${colors.badge}`}>
                          {pred.churn_risk_score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {pred.risk_factors.slice(0, 2).join(' • ')}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setExpandedId(expandedId === pred.contact_id ? null : pred.contact_id)}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === pred.contact_id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {expandedId === pred.contact_id && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
                      <div className="text-xs space-y-1">
                        <div><span className="font-semibold">Health Trend:</span> {pred.health_trend}%</div>
                        <div><span className="font-semibold">Engagement:</span> {pred.engagement_score}%</div>
                        <div><span className="font-semibold">Payment:</span> {pred.payment_score}%</div>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 pt-2">
                        💡 {pred.recommendation}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <button className="text-xs px-2 py-1 bg-current bg-opacity-20 rounded hover:bg-opacity-30 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Call
                        </button>
                        <button className="text-xs px-2 py-1 bg-current bg-opacity-20 rounded hover:bg-opacity-30 flex items-center gap-1">
                          <Gift className="w-3 h-3" /> Offer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}