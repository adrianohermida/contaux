import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/PageNotFound';

const SCENARIOS = {
  optimistic: { label: 'Optimistic (+20%)', multiplier: 1.2, color: '#22c55e' },
  realistic: { label: 'Realistic', multiplier: 1.0, color: '#3b82f6' },
  conservative: { label: 'Conservative (-20%)', multiplier: 0.8, color: '#ef4444' }
};

export default function RevenueForecastWidget({ workspaceId }) {
  const [scenario, setScenario] = useState('realistic');
  const [months, setMonths] = useState(6);

  // Fetch opportunities
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['revenue-forecast', workspaceId],
    queryFn: async () => {
      const opps = await base44.entities.SalesOpportunity.filter({
        workspace_id: workspaceId,
        is_active: true
      });
      return opps || [];
    },
    staleTime: 15 * 60 * 1000,
  });

  // Generate forecast data
  const forecastData = useMemo(() => {
    const data = [];
    const today = new Date();
    const scenarioConfig = SCENARIOS[scenario];

    let cumulativeRevenue = 0;

    for (let i = 0; i < months; i++) {
      const currentDate = new Date(today);
      currentDate.setMonth(currentDate.getMonth() + i);
      const monthLabel = currentDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      // Opportunities likely to close this month
      const oppsByStage = {
        prospect: opportunities.filter(o => o.pipeline_stage === 'prospect'),
        qualified: opportunities.filter(o => o.pipeline_stage === 'qualified'),
        proposal: opportunities.filter(o => o.pipeline_stage === 'proposal'),
        negotiation: opportunities.filter(o => o.pipeline_stage === 'negotiation'),
        won: opportunities.filter(o => o.pipeline_stage === 'won')
      };

      // Calculate expected revenue (weighted by stage probability)
      const stageWeights = {
        prospect: 0.1,
        qualified: 0.25,
        proposal: 0.5,
        negotiation: 0.75,
        won: 1.0
      };

      let monthRevenue = 0;
      Object.entries(oppsByStage).forEach(([stage, opps]) => {
        const stageRevenue = opps.reduce((sum, opp) => {
          const weight = stageWeights[stage];
          const prob = (opp.conversion_probability || 0) / 100;
          return sum + (opp.deal_value * weight * prob);
        }, 0);
        monthRevenue += stageRevenue;
      });

      // Apply scenario multiplier
      monthRevenue = monthRevenue * scenarioConfig.multiplier;
      cumulativeRevenue += monthRevenue;

      data.push({
        month: monthLabel,
        monthRevenue: Math.round(monthRevenue),
        cumulative: Math.round(cumulativeRevenue),
        scenario: scenario
      });
    }

    return data;
  }, [opportunities, scenario, months]);

  // Calculate totals
  const totals = useMemo(() => {
    if (forecastData.length === 0) return { total: 0, avg: 0, peak: 0 };

    const total = forecastData.reduce((sum, d) => sum + d.monthRevenue, 0);
    const avg = Math.round(total / forecastData.length);
    const peak = Math.max(...forecastData.map(d => d.monthRevenue));

    return { total, avg, peak };
  }, [forecastData]);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Forecast
            </CardTitle>
            <CardDescription>Expected revenue based on pipeline and probability</CardDescription>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Scenario selector */}
            <div className="flex gap-2">
              {Object.entries(SCENARIOS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setScenario(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    scenario === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            {/* Months selector */}
            <div className="flex gap-2">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    months === m
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {m}mo
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium">Total Forecast</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totals.total)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium">Monthly Avg</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totals.avg)}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium">Peak Month</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totals.peak)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="monthRevenue"
                fill={SCENARIOS[scenario].color}
                name="Monthly Revenue"
                radius={[8, 8, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Cumulative"
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Stage breakdown */}
        <div className="pt-4 border-t">
          <p className="text-sm font-semibold text-gray-900 mb-3">Pipeline by Stage</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {['prospect', 'qualified', 'proposal', 'negotiation', 'won'].map((stage) => {
              const stageOpps = opportunities.filter(o => o.pipeline_stage === stage);
              const stageValue = stageOpps.reduce((sum, o) => sum + o.deal_value, 0);
              return (
                <div key={stage} className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs font-medium text-gray-600 capitalize">{stage}</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(stageValue)}</p>
                  <p className="text-xs text-gray-500">{stageOpps.length} opps</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}