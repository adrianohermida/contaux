import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/PageNotFound';

const PIPELINE_STAGES = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export default function PipelinePerformanceWidget({ workspaceId }) {
  // Fetch opportunities and activities
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['pipeline-performance', workspaceId],
    queryFn: async () => {
      const opps = await base44.entities.SalesOpportunity.filter({
        workspace_id: workspaceId
      });
      return opps || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const active = opportunities.filter(o => o.is_active);
    const won = opportunities.filter(o => o.pipeline_stage === 'won');
    const lost = opportunities.filter(o => o.pipeline_stage === 'lost');
    const totalValue = active.reduce((sum, o) => sum + o.deal_value, 0);
    const wonValue = won.reduce((sum, o) => sum + o.deal_value, 0);
    const avgDealValue = active.length > 0 ? totalValue / active.length : 0;
    const conversionRate = (won.length / (won.length + lost.length)) * 100 || 0;
    const winLossRatio = lost.length > 0 ? won.length / lost.length : (won.length > 0 ? won.length : 0);

    return {
      totalValue,
      avgDealValue,
      activeOpps: active.length,
      conversionRate,
      wonValue,
      wonCount: won.length,
      lostCount: lost.length,
      winLossRatio
    };
  }, [opportunities]);

  // Calculate funnel data
  const funnelData = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => {
      const stageOpps = opportunities.filter(o => o.pipeline_stage === stage);
      const stageValue = stageOpps.reduce((sum, o) => sum + o.deal_value, 0);
      const prevCount = PIPELINE_STAGES.slice(0, PIPELINE_STAGES.indexOf(stage))
        .reduce((sum, s) => sum + opportunities.filter(o => o.pipeline_stage === s).length, 0) + 
        stageOpps.length;
      
      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        stageKey: stage,
        count: stageOpps.length,
        value: stageValue,
        conversion: prevCount > 0 ? (stageOpps.length / prevCount) * 100 : 0
      };
    });
  }, [opportunities]);

  // Win/Loss analysis by stage
  const stageAnalysis = useMemo(() => {
    return PIPELINE_STAGES.filter(s => s !== 'won' && s !== 'lost').map((stage) => {
      const stageOpps = opportunities.filter(o => o.pipeline_stage === stage);
      const avgProb = stageOpps.length > 0 
        ? stageOpps.reduce((sum, o) => sum + o.conversion_probability, 0) / stageOpps.length 
        : 0;

      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        opportunities: stageOpps.length,
        avgConversion: Math.round(avgProb)
      };
    });
  }, [opportunities]);

  // Sales cycle analysis (days from creation to final stage)
  const cycleAnalysis = useMemo(() => {
    const finalizedOpps = opportunities.filter(o => ['won', 'lost'].includes(o.pipeline_stage));
    
    if (finalizedOpps.length === 0) return { avgCycle: 0, minCycle: 0, maxCycle: 0 };

    const cycles = finalizedOpps.map((opp) => {
      const created = new Date(opp.created_date);
      const now = new Date();
      return Math.floor((now - created) / (1000 * 60 * 60 * 24));
    });

    return {
      avgCycle: Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length),
      minCycle: Math.min(...cycles),
      maxCycle: Math.max(...cycles)
    };
  }, [opportunities]);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Pipeline Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalValue)}</p>
              <p className="text-xs text-blue-600 font-medium mt-2">{kpis.activeOpps} opportunities</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.avgDealValue)}</p>
              <p className="text-xs text-amber-600 font-medium mt-2">per opportunity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(kpis.conversionRate)}%</p>
              <p className="text-xs text-green-600 font-medium mt-2">{kpis.wonCount} won</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Sales Cycle</p>
              <p className="text-2xl font-bold text-gray-900">{cycleAnalysis.avgCycle}</p>
              <p className="text-xs text-purple-600 font-medium mt-2">avg days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>Opportunities by stage with conversion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((item, idx) => {
              const width = item.count > 0 ? (item.count / Math.max(...funnelData.map(d => d.count))) * 100 : 0;
              return (
                <div key={item.stageKey}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.stage}</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.count} opps • {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 flex items-center justify-center transition-all"
                      style={{ width: `${width}%` }}
                    >
                      {width > 15 && (
                        <span className="text-xs font-semibold text-white">
                          {Math.round(item.conversion)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Win/Loss Analysis */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Win/Loss Analysis
          </CardTitle>
          <CardDescription>Average conversion probability by stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageAnalysis} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Bar dataKey="avgConversion" name="Avg Conversion %" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Won Deals</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{kpis.wonCount}</p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(kpis.wonValue)}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Lost Deals</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{kpis.lostCount}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">W/L Ratio</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{kpis.winLossRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">to 1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Cycle Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Sales Cycle Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">Average Cycle</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{cycleAnalysis.avgCycle}</p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">Fastest</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{cycleAnalysis.minCycle}</p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">Slowest</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{cycleAnalysis.maxCycle}</p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}