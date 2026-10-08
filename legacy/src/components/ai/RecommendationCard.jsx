/**
 * RecommendationCard Component
 * Display AI-powered smart recommendations
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Lightbulb, TrendingUp, AlertCircle, MessageCircle } from 'lucide-react';

const ICON_MAP = {
  Lightbulb: Lightbulb,
  TrendingUp: TrendingUp,
  AlertCircle: AlertCircle,
  MessageCircle: MessageCircle,
};

export default function RecommendationCard({
  recommendation,
  onAction,
  onFeedback,
}) {
  const Icon = ICON_MAP[recommendation.icon] || Lightbulb;

  const getConfidenceBadgeColor = () => {
    if (recommendation.confidence >= 0.85) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (recommendation.confidence >= 0.7) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getTypeColor = () => {
    const colors = {
      'follow-up': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      opportunity: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      data: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      campaign: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      process: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      risk: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[recommendation.type] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  };

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg mt-1">
              <Icon className="w-5 h-5 dark:text-slate-300" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base dark:text-slate-100">
                {recommendation.title}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {recommendation.description}
              </p>
            </div>
          </div>
          <Badge className={getTypeColor()}>{recommendation.type}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Confidence Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400">Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-full rounded-full ${
                  recommendation.confidence >= 0.85
                    ? 'bg-green-500'
                    : recommendation.confidence >= 0.7
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                }`}
                style={{ width: `${recommendation.confidence * 100}%` }}
              />
            </div>
            <Badge className={getConfidenceBadgeColor()}>
              {Math.round(recommendation.confidence * 100)}%
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={() => onAction?.(recommendation)}
            className="flex-1 gap-2 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {recommendation.action}
          </Button>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFeedback?.(recommendation.id, 'helpful')}
              className="gap-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFeedback?.(recommendation.id, 'not-helpful')}
              className="gap-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}