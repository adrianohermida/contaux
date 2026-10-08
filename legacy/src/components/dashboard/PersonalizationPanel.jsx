/**
 * PersonalizationPanel Component
 * AI-powered personalization, recommendations, A/B testing, and user segmentation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  Zap,
  Target,
  Users,
  TrendingUp,
  Brain,
  Award,
  Plus,
  MoreVertical,
  CheckCircle,
} from 'lucide-react';
import { useAIPersonalization } from '@/components/hooks/useAIPersonalization';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function PersonalizationPanel() {
  const {
    personalizationState,
    recommendations,
    abTests,
    userSegments,
    buildUserProfile,
    generateRecommendations,
    createABTest,
    assignVariant,
    trackConversion,
    getPersonalizationSummary,
    updateRecommendations,
    getInsights,
  } = useAIPersonalization();

  const [activeTab, setActiveTab] = useState('recommendations');
  const [userProfile, setUserProfile] = useState(null);
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    // Initialize user profile
    const profile = buildUserProfile({
      userId: 'user-001',
      segment: 'engaged',
      engagement: 'high',
      viewCount: 45,
      clickCount: 12,
      purchaseCount: 3,
      lifetime_value: 2500,
      churnRisk: 'low',
    });

    setUserProfile(profile);
    updateRecommendations(profile);

    // Get summary and insights
    const sum = getPersonalizationSummary();
    setSummary(sum);
    setInsights(getInsights());
  }, [buildUserProfile, updateRecommendations, getPersonalizationSummary, getInsights]);

  // Mock A/B test data
  const testData = abTests.map((test) => ({
    name: test.name,
    'Variant A': (test.variants[0]?.conversions / (test.variants[0]?.visits || 1)) * 100 || 0,
    'Variant B': (test.variants[1]?.conversions / (test.variants[1]?.visits || 1)) * 100 || 0,
  }));

  // Mock segment data
  const segmentChartData = userSegments.map((seg) => ({
    name: seg.name,
    value: seg.count,
  }));

  const handleCreateTest = () => {
    createABTest({
      name: `Test ${abTests.length + 1}`,
      hypothesis: 'Variant B increases conversion rate',
      metric: 'conversion_rate',
      duration: 604800000, // 7 days
    });
  };

  const handleTrackConversion = (testId, variantId) => {
    trackConversion(testId, variantId);
    setSummary(getPersonalizationSummary());
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          AI Personalization
        </h2>
        <Button
          onClick={handleCreateTest}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-opacity-80"
        >
          <Plus className="w-4 h-4 mr-2" />
          New A/B Test
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Tests</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.activeTests || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Recommendations</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{recommendations.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Segments</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{userSegments.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Lift</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">+12.5%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="dark:bg-slate-800 dark:border-slate-700 grid w-full grid-cols-4">
          <TabsTrigger value="recommendations" className="dark:text-slate-300">
            <Zap className="w-4 h-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="tests" className="dark:text-slate-300">
            <Target className="w-4 h-4 mr-2" />
            A/B Tests
          </TabsTrigger>
          <TabsTrigger value="segments" className="dark:text-slate-300">
            <Users className="w-4 h-4 mr-2" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="insights" className="dark:text-slate-300">
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Recommended Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <div key={rec.id} className="p-3 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium dark:text-slate-100">{rec.name}</p>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
                          {rec.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{rec.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 dark:text-blue-400">{rec.score}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">⭐ {rec.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {userProfile && (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base dark:text-slate-100">User Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Engagement</p>
                    <p className="font-medium dark:text-slate-100 capitalize">{userProfile.engagement}</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Lifetime Value</p>
                    <p className="font-medium dark:text-slate-100">${userProfile.lifetime_value}</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Views</p>
                    <p className="font-medium dark:text-slate-100">{userProfile.behavior?.viewCount}</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Churn Risk</p>
                    <p className="font-medium dark:text-slate-100 capitalize">{userProfile.churnRisk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="tests" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Test Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {testData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={testData}>
                    <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-700" />
                    <XAxis dataKey="name" className="text-slate-600 dark:text-slate-400" />
                    <YAxis className="text-slate-600 dark:text-slate-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Variant A" fill="#3b82f6" />
                    <Bar dataKey="Variant B" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 py-8">No active tests. Create one to get started.</p>
              )}
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Active Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {abTests.map((test) => (
                  <div key={test.id} className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium dark:text-slate-100">{test.name}</p>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900">Active</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      {test.variants.map((variant) => (
                        <div key={variant.id} className="p-2 bg-white dark:bg-slate-600 rounded">
                          <p className="text-slate-600 dark:text-slate-400">{variant.name}</p>
                          <p className="font-medium dark:text-slate-100">{variant.visits} visits</p>
                          <p className="text-slate-600 dark:text-slate-400">{variant.conversions} conv</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">User Segments Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {segmentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {segmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 py-8">No segments available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Segment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userSegments.map((segment) => (
                  <div key={segment.name} className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <div className="flex items-center justify-between">
                      <p className="font-medium dark:text-slate-100 capitalize">{segment.name}</p>
                      <Badge>{segment.count} users</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {segment.characteristics?.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.length > 0 ? (
                  insights.map((insight, idx) => (
                    <div key={idx} className="p-3 bg-slate-100 dark:bg-slate-700 rounded flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium dark:text-slate-100 capitalize">{insight.type}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {insight.test || insight.segment}: {insight.winner || insight.action || insight.count}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400 py-4">No significant insights yet. Keep running tests!</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm dark:text-slate-300">
                <li>✓ Test new layouts to improve engagement</li>
                <li>✓ Focus on premium user retention</li>
                <li>✓ Personalize onboarding for new users</li>
                <li>✓ Create targeted campaigns for at-risk users</li>
                <li>✓ Monitor conversion metrics weekly</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}