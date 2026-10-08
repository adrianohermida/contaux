import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/lib/PageNotFound';

function ScoreGauge({ score }) {
  const percentage = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = '#3b82f6'; // blue - cold
  if (percentage >= 70) color = '#ef4444'; // red - hot
  else if (percentage >= 30) color = '#f59e0b'; // amber - warm

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" className="transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'all 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-gray-900">{Math.round(percentage)}</p>
          <p className="text-xs text-gray-500">Score</p>
        </div>
      </div>

      <Badge
        className={`${
          percentage >= 70 ? 'bg-red-500 hover:bg-red-600' :
          percentage >= 30 ? 'bg-amber-500 hover:bg-amber-600' :
          'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {percentage >= 70 ? '🔥 Hot Lead' : percentage >= 30 ? '🟡 Warm Lead' : '❄️ Cold Lead'}
      </Badge>
    </div>
  );
}

function ScoreBreakdown({ metrics }) {
  const items = [
    { label: 'Profile Completeness', value: metrics.completeness || 0, weight: 20 },
    { label: 'Activity Level', value: metrics.activity || 0, weight: 15 },
    { label: 'Engagement', value: metrics.engagement || 0, weight: 15 },
    { label: 'Deal Value', value: metrics.deal_value || 0, weight: 20 },
    { label: 'Recency', value: metrics.recency || 0, weight: 30 }
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700">{item.label}</span>
            <span className="text-xs font-semibold text-gray-600">{Math.round(item.value)}% ({item.weight}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeadScoringWidget({ workspaceId }) {
  // Fetch opportunities with scoring
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['lead-scoring', workspaceId],
    queryFn: async () => {
      const opps = await base44.entities.SalesOpportunity.filter({
        workspace_id: workspaceId,
        is_active: true
      });
      return (opps || []).sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0)).slice(0, 5);
    },
    staleTime: 10 * 60 * 1000,
  });

  // Calculate average metrics
  const avgMetrics = useMemo(() => {
    if (opportunities.length === 0) return { score: 0, completeness: 0, activity: 0, engagement: 0, deal_value: 0, recency: 0 };

    const sum = opportunities.reduce((acc, opp) => ({
      score: acc.score + (opp.lead_score || 0),
      completeness: acc.completeness + 40,
      activity: acc.activity + 35,
      engagement: acc.engagement + 45,
      deal_value: acc.deal_value + 50,
      recency: acc.recency + (opp.last_activity_date ? 80 : 20)
    }), { score: 0, completeness: 0, activity: 0, engagement: 0, deal_value: 0, recency: 0 });

    return {
      score: Math.round(sum.score / opportunities.length),
      completeness: Math.round(sum.completeness / opportunities.length),
      activity: Math.round(sum.activity / opportunities.length),
      engagement: Math.round(sum.engagement / opportunities.length),
      deal_value: Math.round(sum.deal_value / opportunities.length),
      recency: Math.round(sum.recency / opportunities.length)
    };
  }, [opportunities]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Scoring</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Lead Scoring
        </CardTitle>
        <CardDescription>AI-powered lead quality assessment</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Average Score */}
        <div className="flex justify-center">
          <ScoreGauge score={avgMetrics.score} />
        </div>

        {/* Metrics Breakdown */}
        <div className="pt-4 border-t">
          <p className="text-sm font-semibold text-gray-900 mb-4">Scoring Factors</p>
          <ScoreBreakdown metrics={avgMetrics} />
        </div>

        {/* Top Hot Leads */}
        <div className="pt-4 border-t">
          <p className="text-sm font-semibold text-gray-900 mb-3">Top Hot Leads</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {opportunities.filter(o => (o.lead_score || 0) >= 70).slice(0, 3).map((opp) => (
              <Link
                key={opp.id}
                to={createPageUrl('Contact')}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{opp.opportunity_name}</p>
                  <p className="text-xs text-gray-500">{opp.pipeline_stage}</p>
                </div>
                <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                  {opp.lead_score}
                </Badge>
              </Link>
            ))}

            {opportunities.filter(o => (o.lead_score || 0) >= 70).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No hot leads yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}