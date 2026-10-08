import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';

const getRiskColor = (risk) => {
  if (risk >= 70) return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: AlertTriangle, text: 'text-red-700 dark:text-red-400' };
  if (risk >= 40) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: AlertCircle, text: 'text-yellow-700 dark:text-yellow-400' };
  return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: CheckCircle, text: 'text-green-700 dark:text-green-400' };
};

export default function RetentionRiskWidget({ workspaceId }) {
  const [expanded, setExpanded] = useState(null);

  const { data: healthData = { health_scores: [] }, isLoading } = useQuery({
    queryKey: ['retention-risk', workspaceId],
    queryFn: async () => {
      const response = await base44.functions.invoke('calculateCustomerHealth', { 
        workspace_id: workspaceId 
      });
      return response.data || { health_scores: [] };
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Retention Risk
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

  const scores = healthData.health_scores || [];
  
  // Calculate risk score for each customer
  const customers = scores.map(score => {
    let riskScore = 100 - score.health_score;
    let factors = [];

    if (score.health_score < 50) factors.push('Low health score');
    if (score.engagement_level < 30) factors.push('Low engagement');
    if (score.payment_health < 80) factors.push('Payment issues');
    if (score.usage_adoption < 40) factors.push('Low usage');

    return {
      ...score,
      riskScore: Math.min(riskScore + factors.length * 10, 100),
      factors
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  const criticalRisk = customers.filter(c => c.riskScore >= 70).length;
  const warningRisk = customers.filter(c => c.riskScore >= 40 && c.riskScore < 70).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Retention Risk
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {criticalRisk} critical • {warningRisk} warning
        </p>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No customers to analyze</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customers.slice(0, 8).map(customer => {
              const colors = getRiskColor(customer.riskScore);
              const Icon = colors.icon;
              
              return (
                <div key={customer.contact_id} className={`p-3 border rounded-lg ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${colors.text}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          Customer
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Health: {customer.health_score} | Risk: {Math.round(customer.riskScore)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setExpanded(expanded === customer.contact_id ? null : customer.contact_id)}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expanded === customer.contact_id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {expanded === customer.contact_id && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
                      <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Risk Factors:</h5>
                      {customer.factors.length > 0 ? (
                        <ul className="space-y-1">
                          {customer.factors.map((factor, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-600 dark:text-slate-400">No risk factors detected</p>
                      )}
                      <div className="pt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        💡 {customer.recommendation}
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