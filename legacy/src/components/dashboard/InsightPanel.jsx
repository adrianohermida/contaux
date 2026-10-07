/**
 * InsightPanel Component
 * AI-powered business insights and recommendations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, TrendingUp } from 'lucide-react';

export default function InsightPanel() {
  const [insights] = useState([
    {
      id: 'insight_001',
      title: 'Revenue Opportunity',
      description: 'Increasing marketing spend in Q2 could boost revenue by 15-20%',
      confidence: 0.92,
      category: 'opportunity',
      priority: 'high',
    },
    {
      id: 'insight_002',
      title: 'Cost Optimization',
      description: 'Consolidating vendor contracts could reduce operational costs by 8%',
      confidence: 0.88,
      category: 'optimization',
      priority: 'medium',
    },
    {
      id: 'insight_003',
      title: 'Market Trend',
      description: 'Competitors increasing AI integration - recommend prioritization',
      confidence: 0.85,
      category: 'trend',
      priority: 'high',
    },
    {
      id: 'insight_004',
      title: 'Risk Alert',
      description: 'Customer churn rate trending up - requires intervention',
      confidence: 0.78,
      category: 'risk',
      priority: 'critical',
    },
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'opportunity':
        return <TrendingUp className="w-4 h-4" />;
      case 'optimization':
        return <Target className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">AI Insights</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {insights.length} Active
        </Badge>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <Card key={insight.id} className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-2">
                {getCategoryIcon(insight.category)}
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {insight.description}
                  </p>
                </div>
                <Badge className={getPriorityColor(insight.priority)}>
                  {insight.priority.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                <button className="text-blue-600 dark:text-blue-400 hover:underline">
                  View Details →
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}