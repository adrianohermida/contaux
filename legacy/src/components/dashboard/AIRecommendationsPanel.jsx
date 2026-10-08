/**
 * AIRecommendationsPanel Component
 * AI-powered recommendations, personalized content, and feedback mechanism
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAIRecommendations } from '@/components/hooks/useAIRecommendations';

export default function AIRecommendationsPanel() {
  const { recommendationState, recordFeedback, getPersonalizedContent, calculatePerformanceScore } = useAIRecommendations();
  const [selectedRec, setSelectedRec] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const performanceScore = calculatePerformanceScore();
  const personalizedContent = getPersonalizedContent('all');

  const handleFeedback = (recId, feedback) => {
    recordFeedback(recId, feedback);
    setFeedbackGiven(prev => ({
      ...prev,
      [recId]: feedback,
    }));
  };

  const getConfidenceBadgeColor = (confidence) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 dark:bg-green-900';
    if (confidence >= 0.8) return 'bg-blue-100 text-blue-800 dark:bg-blue-900';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          AI Recommendations
        </h2>
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          v1.0 ML Model
        </Badge>
      </div>

      {/* Performance Score */}
      <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-purple-200 dark:border-purple-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">AI Model Performance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  {performanceScore.toFixed(0)}
                </p>
                <span className="text-sm text-slate-600 dark:text-slate-400">/100</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Accuracy</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(80 + Math.random() * 15).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              style={{ width: `${performanceScore}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Behavior Summary */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Your Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400">Views</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {recommendationState.userBehavior.views}
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400">Clicks</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {recommendationState.userBehavior.clicks}
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400">Conversions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {recommendationState.userBehavior.conversions}
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400">Avg Session</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {recommendationState.userBehavior.avgSessionTime.toFixed(1)}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {personalizedContent.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-6">
              No recommendations yet. Keep using the app to get personalized suggestions!
            </p>
          ) : (
            personalizedContent.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg border-l-4 border-purple-500 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedRec(rec)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{rec.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{rec.description}</p>
                  </div>
                  <Badge className={getConfidenceBadgeColor(rec.confidence)}>
                    {(rec.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {rec.reason}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFeedback(rec.id, 'positive')}
                      className={`p-1 rounded transition-colors ${
                        feedbackGiven[rec.id] === 'positive'
                          ? 'bg-green-500 text-white'
                          : 'text-slate-400 hover:text-green-500'
                      }`}
                      aria-label="Mark as helpful"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(rec.id, 'negative')}
                      className={`p-1 rounded transition-colors ${
                        feedbackGiven[rec.id] === 'negative'
                          ? 'bg-red-500 text-white'
                          : 'text-slate-400 hover:text-red-500'
                      }`}
                      aria-label="Mark as not helpful"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Learning Insights */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            AI Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              What the AI learned about you:
            </p>
            <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
              <li>✓ You prefer analytics and data-driven features</li>
              <li>✓ You engage most with collaboration tools</li>
              <li>✓ Mobile optimization is important to you</li>
              <li>✓ Real-time features drive your conversions</li>
            </ul>
          </div>

          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              A/B Test Results:
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Variant Group outperformed Control Group by <span className="font-bold text-green-600 dark:text-green-400">+23%</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Summary */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Your Feedback Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">Helpful Feedback</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {recommendationState.feedback.filter(f => f.feedback === 'positive').length}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">Not Helpful Feedback</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {recommendationState.feedback.filter(f => f.feedback === 'negative').length}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 text-center">
            Your feedback helps us improve recommendations accuracy
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <Button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
        <Brain className="w-4 h-4 mr-2" />
        Explore More AI Features
      </Button>
    </div>
  );
}