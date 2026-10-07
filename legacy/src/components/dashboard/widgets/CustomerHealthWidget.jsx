import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Heart } from 'lucide-react';

const getHealthColor = (score) => {
  if (score >= 75) return { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' };
  if (score >= 50) return { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' };
  return { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' };
};

const TrendIcon = ({ trend }) => {
  if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-slate-500" />;
};

const CircularGauge = ({ score }) => {
  const colors = getHealthColor(score);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={colors.text}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold">{score}</div>
            <div className="text-xs text-slate-500">Health Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CustomerHealthWidget({ workspaceId }) {
  const { data: healthData = { health_scores: [] }, isLoading } = useQuery({
    queryKey: ['customer-health', workspaceId],
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
            <Heart className="w-5 h-5" />
            Customer Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const scores = healthData.health_scores || [];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.health_score, 0) / scores.length) : 0;
  const healthyCount = scores.filter(s => s.health_status === 'healthy').length;
  const atRiskCount = scores.filter(s => s.health_status === 'at_risk').length;
  const criticalCount = scores.filter(s => s.health_status === 'critical').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Customer Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gauge */}
          <CircularGauge score={avgScore} />

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-sm font-semibold text-green-700 dark:text-green-400">{healthyCount}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Healthy</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{atRiskCount}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">At Risk</div>
            </div>
            <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <div className="text-sm font-semibold text-red-700 dark:text-red-400">{criticalCount}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Critical</div>
            </div>
          </div>

          {/* Factors */}
          {scores.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Top Customer</h4>
              {scores.slice(0, 1).map(score => (
                <div key={score.contact_id} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Payment</span>
                    <span className="font-semibold">{score.payment_health}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded">
                    <div
                      className="bg-green-500 h-1.5 rounded"
                      style={{ width: `${score.payment_health}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-3">
                    <span>Engagement</span>
                    <span className="font-semibold">{score.engagement_level}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded">
                    <div
                      className="bg-blue-500 h-1.5 rounded"
                      style={{ width: `${score.engagement_level}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-3">
                    <span>Usage</span>
                    <span className="font-semibold">{score.usage_adoption}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded">
                    <div
                      className="bg-purple-500 h-1.5 rounded"
                      style={{ width: `${score.usage_adoption}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                    <TrendIcon trend={score.trend} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{score.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}