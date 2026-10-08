/**
 * AnalyticsInsightsDashboard Component
 * Real-time analytics with predictive insights, cohort analysis, and funnel tracking
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
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Users,
  Target,
  AlertCircle,
  Download,
  TrendingDown,
  Zap,
  Brain,
} from 'lucide-react';
import { useAdvancedAnalyticsEngine } from '@/components/hooks/useAdvancedAnalyticsEngine';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsInsightsDashboard() {
  const { analyticsState, trackEvent, getAnalyticsSummary, createCohorts, calculateFunnel, cohortData, eventData } = useAdvancedAnalyticsEngine();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const data = getAnalyticsSummary();
    setSummary(data);
    createCohorts();
  }, [getAnalyticsSummary, createCohorts]);

  // Mock funnel data
  const funnelSteps = calculateFunnel(['view', 'click', 'signup', 'purchase']);

  // Mock trend data
  const trendData = [
    { day: 'Mon', events: 240, users: 45, conversions: 12 },
    { day: 'Tue', events: 320, users: 67, conversions: 18 },
    { day: 'Wed', events: 280, users: 52, conversions: 15 },
    { day: 'Thu', events: 450, users: 89, conversions: 28 },
    { day: 'Fri', events: 520, users: 102, conversions: 35 },
    { day: 'Sat', events: 380, users: 71, conversions: 22 },
    { day: 'Sun', events: 290, users: 55, conversions: 16 },
  ];

  const handleExport = (format) => {
    const data = JSON.stringify(summary, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          Analytics & Insights
        </h2>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded dark:text-slate-100"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button
            onClick={() => handleExport('json')}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-opacity-80"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Events</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analyticsState.totalEvents}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Users</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analyticsState.activeUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Conversion Rate</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{analyticsState.conversionRate.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Session</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{analyticsState.avgSessionDuration.toFixed(0)}s</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Bounce Rate</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{analyticsState.bounceRate.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="dark:bg-slate-800 dark:border-slate-700 grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="dark:text-slate-300">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="funnel" className="dark:text-slate-300">
            <Target className="w-4 h-4 mr-2" />
            Funnel
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="dark:text-slate-300">
            <Users className="w-4 h-4 mr-2" />
            Cohorts
          </TabsTrigger>
          <TabsTrigger value="insights" className="dark:text-slate-300">
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Events & Users Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-700" />
                  <XAxis dataKey="day" className="text-slate-600 dark:text-slate-400" />
                  <YAxis className="text-slate-600 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Area type="monotone" dataKey="events" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEvents)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base dark:text-slate-100">Conversions by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-700" />
                    <XAxis dataKey="day" className="text-slate-600 dark:text-slate-400" />
                    <YAxis className="text-slate-600 dark:text-slate-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Bar dataKey="conversions" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base dark:text-slate-100">User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={trendData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ day, users }) => `${day}: ${users}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {trendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Funnel
                    dataKey="count"
                    data={funnelSteps}
                    fill="#3b82f6"
                  >
                    {funnelSteps.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Funnel Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnelSteps.map((step, idx) => (
                  <div key={step.step} className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium dark:text-slate-100">{step.step}</p>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
                        {step.count} events
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Unique Users</p>
                        <p className="font-medium dark:text-slate-100">{step.uniqueUsers}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Conversion Rate</p>
                        <p className="font-medium dark:text-slate-100">{step.rate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Behavioral Cohorts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cohortData.slice(0, 8).map((cohort) => (
                  <div key={cohort.name} className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium dark:text-slate-100">{cohort.name}</p>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900">
                        {cohort.userCount} users
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Events</p>
                        <p className="font-medium dark:text-slate-100">{cohort.eventCount}</p>
                      </div>
                    </div>
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
                <Brain className="w-5 h-5 text-purple-500" />
                Predictive Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.predictive && (
                  <>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Growth Trend</p>
                      <div className="flex items-center gap-2 mt-1">
                        {summary.predictive.growthMomentum === 'positive' ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                        <p className="font-medium dark:text-slate-100">{summary.predictive.trend}%</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Predicted Conversion</p>
                      <p className="font-medium dark:text-slate-100 mt-1">{summary.predictive.predictedConversion}%</p>
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Churn Risk</p>
                      <p className="font-medium dark:text-slate-100 mt-1">
                        {summary.predictive.churnRisk.toFixed(2)}%
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm dark:text-slate-300">
                <li>✓ Focus on improving conversion at signup stage</li>
                <li>✓ Investigate bounce rate increase on Sundays</li>
                <li>✓ Segment users with high engagement for retention campaigns</li>
                <li>✓ Test personalization to reduce churn risk</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}