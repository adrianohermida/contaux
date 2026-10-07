/**
 * Analytics Dashboard Component
 * Display KPIs, charts, and business metrics
 */

import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useChartData } from '../hooks/useChartData';
import { useGlobalAuth } from '../auth/useGlobalAuth';
import KPICard from './KPICard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const { workspaceId } = useGlobalAuth('internal');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const { revenueMetrics, contactMetrics, salesMetrics, rawData } = useAnalytics(
    workspaceId,
    dateRange
  );

  const {
    revenueTrendData,
    invoiceStatusData,
    pipelineData,
    conversionFunnelData,
  } = useChartData(rawData.invoices, rawData.opportunities);

  const handleExport = () => {
    const data = {
      revenue: revenueMetrics,
      contacts: contactMetrics,
      sales: salesMetrics,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Analytics Dashboard
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="dark:border-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="dark:border-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`R$ ${revenueMetrics.totalRevenue}`}
          trend={12}
          trendLabel="vs last month"
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Active Clients"
          value={contactMetrics.activeClients}
          trend={5}
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Won Opportunities"
          value={salesMetrics.wonOpportunities}
          trend={8}
          icon={TrendingUp}
          color="purple"
        />
        <KPICard
          title="Pending Invoices"
          value={revenueMetrics.pendingInvoices}
          trend={-3}
          icon={Clock}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Revenue Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Pipeline */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Sales Pipeline
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Status */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Invoice Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Conversion Funnel
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={conversionFunnelData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 100, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="stage" type="category" stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            Revenue Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Average Invoice Value</span>
              <span className="font-semibold dark:text-slate-200">
                R$ {revenueMetrics.averageInvoiceValue}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Paid Invoices</span>
              <span className="font-semibold dark:text-slate-200">{revenueMetrics.paidInvoices}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Amount</span>
              <span className="font-semibold dark:text-slate-200">
                R$ {revenueMetrics.pendingAmount}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            Contact Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Clients</span>
              <span className="font-semibold dark:text-slate-200">{contactMetrics.totalClients}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Rate</span>
              <span className="font-semibold dark:text-slate-200">{contactMetrics.growthRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Inactive</span>
              <span className="font-semibold dark:text-slate-200">
                {contactMetrics.inactiveClients}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            Sales Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Win Rate</span>
              <span className="font-semibold dark:text-slate-200">{salesMetrics.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Pipeline Value</span>
              <span className="font-semibold dark:text-slate-200">
                R$ {salesMetrics.totalPipelineValue}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Deal Value</span>
              <span className="font-semibold dark:text-slate-200">
                R$ {salesMetrics.averageDealValue}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}