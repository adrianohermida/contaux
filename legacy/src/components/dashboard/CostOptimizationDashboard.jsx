import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingDown, DollarSign, Zap, Database, Wifi } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Cost Optimization Dashboard - PHASE 14.4
 * Analyzes costs and provides optimization recommendations
 */

export default function CostOptimizationDashboard() {
  const [costs, setCosts] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCostData = async () => {
      try {
        // Simulated metrics
        const metrics = {
          instances: { on_demand: 8, reserved: 3, spot: 1, total: 12 },
          storage: { db: 500, cdn: 100, backups: 200 },
          networking: { transfer: 5000, api: 100 },
          current_cost: 70,
        };

        const response = await base44.functions.invoke('costAnalytics', {
          action: 'analyze',
          metrics,
          monthlyBudget: 50000,
          historicalCosts: generateHistoricalData(),
        });

        setCosts(response.data.costs);
        setRecommendations(response.data.recommendations);

        const forecastRes = await base44.functions.invoke('costAnalytics', {
          action: 'forecast',
          historicalCosts: generateHistoricalData(),
        });
        setForecast(forecastRes.data.forecast);

        const budgetRes = await base44.functions.invoke('costAnalytics', {
          action: 'budget-check',
          metrics,
          monthlyBudget: 50000,
        });
        setBudgetStatus(budgetRes.data);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch cost data:', error);
      }
    };

    const generateHistoricalData = () => {
      const data = [];
      for (let i = 0; i < 30; i++) {
        data.push({
          total_hourly: 85 + Math.random() * 20,
          total_monthly: (85 + Math.random() * 20) * 730,
        });
      }
      return data;
    };

    fetchCostData();
  }, []);

  if (loading || !costs) {
    return <div className="p-8 text-center">Loading cost data...</div>;
  }

  const costBreakdown = [
    { name: 'On-Demand Instances', value: costs.compute.on_demand * 5 * 730, color: '#ef4444' },
    { name: 'Reserved Instances', value: costs.compute.reserved * 2.5 * 730, color: '#f97316' },
    { name: 'Storage & CDN', value: (costs.storage.database + costs.storage.cdn) * 730, color: '#3b82f6' },
    { name: 'Networking', value: (costs.networking.data_transfer * 0.5 + costs.networking.api_calls / 1000000 * 3.5) * 730, color: '#8b5cf6' },
  ];

  return (
    <div className="w-full space-y-6 p-6 bg-slate-50 dark:bg-slate-900">
      {/* Budget Status */}
      {budgetStatus && (
        <Card className={budgetStatus.alert ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Budget</p>
                <p className="text-2xl font-bold">${(budgetStatus.budget / 1000).toFixed(0)}k</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Projected Cost</p>
                <p className="text-2xl font-bold">${(budgetStatus.projected_cost / 1000).toFixed(0)}k</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Utilization</p>
                <p className={`text-2xl font-bold ${budgetStatus.utilization_percent > 100 ? 'text-red-500' : budgetStatus.utilization_percent > 90 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {budgetStatus.utilization_percent}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className={`text-lg font-semibold capitalize ${
                  budgetStatus.status === 'on_track' ? 'text-green-500' : 
                  budgetStatus.status === 'at_risk' ? 'text-yellow-500' : 
                  'text-red-500'
                }`}>
                  {budgetStatus.status.replace('_', ' ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={costBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}k`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Trend (Last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { day: '1', cost: 60000 },
                { day: '5', cost: 62000 },
                { day: '10', cost: 65000 },
                { day: '15', cost: 68000 },
                { day: '20', cost: 70000 },
                { day: '25', cost: 72000 },
                { day: '30', cost: 71000 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost Forecast */}
      {forecast && (
        <Card>
          <CardHeader>
            <CardTitle>3-Month Cost Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-600">Next 30 Days</p>
                <p className="text-2xl font-bold">${(forecast.next_30_days / 1000).toFixed(0)}k</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Next 60 Days</p>
                <p className="text-2xl font-bold">${(forecast.next_60_days / 1000).toFixed(0)}k</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Next 90 Days</p>
                <p className="text-2xl font-bold">${(forecast.next_90_days / 1000).toFixed(0)}k</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { period: 'Next 30 Days', cost: forecast.next_30_days },
                { period: 'Next 60 Days', cost: forecast.next_60_days },
                { period: 'Next 90 Days', cost: forecast.next_90_days },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Bar dataKey="cost" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Cost Optimization Recommendations
          </CardTitle>
          <CardDescription>Estimated annual savings: ${recommendations.reduce((sum, r) => sum + (r.savings_annual || 0), 0) / 1000} k</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold capitalize">{rec.type.replace('_', ' ')}</h3>
                  <p className="text-sm text-slate-600">{rec.action}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-500">${(rec.savings_annual / 1000).toFixed(0)}k/year</p>
                  <p className="text-sm text-slate-600">{rec.savings_percent}% savings</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Service Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4" />
              Compute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${((costs.compute.on_demand + costs.compute.reserved + costs.compute.spot) * 730).toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">Monthly estimate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-4 h-4" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${((costs.storage.database + costs.storage.cdn + costs.storage.backups) * 730).toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">Monthly estimate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="w-4 h-4" />
              Networking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${((costs.networking.data_transfer + costs.networking.api_calls) * 730).toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">Monthly estimate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}