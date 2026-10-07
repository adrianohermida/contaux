/**
 * Reports Analytics Page
 * Advanced analytics dashboard with AI insights and KPI tracking
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, TrendingUp, DollarSign, Target, Activity,
  BarChart2, RefreshCw, Download
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useGlobalAuth } from '@/components/auth/useGlobalAuth';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import KPIWidget from '@/components/analytics/KPIWidget';
import PredictiveReport from '@/components/analytics/PredictiveReport';
import DashboardCustomizer, { useDashboardConfig } from '@/components/analytics/DashboardCustomizer';
import ExportEngine from '@/components/analytics/ExportEngine';
import { format, subDays, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsAnalytics() {
  const { user, workspaceId } = useGlobalAuth();
  const { isEnabled } = useDashboardConfig();

  // Fetch contacts
  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['analytics-contacts', workspaceId],
    queryFn: () => base44.entities.Client.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
  });

  // Fetch opportunities
  const { data: opportunities = [], isLoading: loadingOps } = useQuery({
    queryKey: ['analytics-opportunities', workspaceId],
    queryFn: () => base44.entities.SalesOpportunity.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
  });

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ['analytics-tags', workspaceId],
    queryFn: () => base44.entities.ContactTag.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
  });

  // Compute analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const activeContacts = contacts.filter(c => c.status === 'active').length;
    const newThisMonth = contacts.filter(c => new Date(c.created_date) >= startOfThisMonth).length;
    const newPrev = contacts.filter(c => {
      const d = new Date(c.created_date);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    }).length;
    const growthRate = newPrev > 0 ? ((newThisMonth - newPrev) / newPrev) * 100 : 0;

    const openOps = opportunities.filter(o => !['won', 'lost'].includes(o.pipeline_stage));
    const wonOps = opportunities.filter(o => o.pipeline_stage === 'won');
    const pipelineValue = openOps.reduce((sum, o) => sum + (o.deal_value || 0), 0);
    const wonValue = wonOps.reduce((sum, o) => sum + (o.deal_value || 0), 0);
    const conversionRate = opportunities.length > 0
      ? (wonOps.length / opportunities.length) * 100
      : 0;

    // Monthly contact growth (last 6 months)
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subDays(now, (5 - i) * 30);
      const label = format(date, 'MMM', { locale: ptBR });
      const count = contacts.filter(c => {
        const d = new Date(c.created_date);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      }).length;
      return { month: label, contatos: count };
    });

    // Pipeline by stage
    const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const pipelineByStage = stages.map(stage => ({
      stage,
      count: opportunities.filter(o => o.pipeline_stage === stage).length,
      value: opportunities
        .filter(o => o.pipeline_stage === stage)
        .reduce((sum, o) => sum + (o.deal_value || 0), 0),
    })).filter(s => s.count > 0);

    // Tag distribution
    const tagDistribution = tags
      .filter(t => t.contact_count > 0)
      .sort((a, b) => b.contact_count - a.contact_count)
      .slice(0, 6)
      .map(t => ({ name: t.name, value: t.contact_count }));

    // Status breakdown
    const statusBreakdown = ['active', 'inactive', 'suspended'].map(status => ({
      status,
      count: contacts.filter(c => c.status === status).length,
    })).filter(s => s.count > 0);

    return {
      totalContacts: contacts.length,
      activeContacts,
      newThisMonth,
      growthRate: Number(growthRate.toFixed(1)),
      openOpportunities: openOps.length,
      pipelineValue,
      wonValue,
      conversionRate: Number(conversionRate.toFixed(1)),
      months,
      pipelineByStage,
      tagDistribution,
      statusBreakdown,
    };
  }, [contacts, opportunities, tags]);

  const isLoading = loadingContacts || loadingOps;

  // Export columns
  const contactColumns = [
    { key: 'company_name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'created_date', label: 'Data Criação' },
  ];

  return (
    <div className="p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] space-y-[var(--spacing-lg)] max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-[var(--spacing-md)]">
        <div>
          <h1 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-foreground-primary)] flex items-center gap-[var(--spacing-sm)]">
            <BarChart2 className="w-6 h-6 text-[var(--color-interactive-default)]" aria-hidden="true" />
            Analytics
          </h1>
          <p className="text-sm text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">
            Visão completa do seu CRM
          </p>
        </div>
        <div className="flex gap-[var(--spacing-sm)]">
          <ExportEngine
            data={contacts}
            filename="contatos-analytics"
            columns={contactColumns}
          />
          <DashboardCustomizer />
        </div>
      </div>

      {/* KPI Cards */}
      {(isEnabled('kpi_contacts') || isEnabled('kpi_revenue') || isEnabled('kpi_pipeline') || isEnabled('kpi_conversion')) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)]">
          {isEnabled('kpi_contacts') && (
            <KPIWidget
              title="Total de Contatos"
              value={analytics.totalContacts}
              previousValue={analytics.totalContacts - analytics.newThisMonth}
              icon={Users}
              color="blue"
              isLoading={isLoading}
            />
          )}
          {isEnabled('kpi_revenue') && (
            <KPIWidget
              title="Receita Ganha"
              value={analytics.wonValue}
              format="currency"
              icon={DollarSign}
              color="green"
              isLoading={isLoading}
            />
          )}
          {isEnabled('kpi_pipeline') && (
            <KPIWidget
              title="Pipeline Aberto"
              value={analytics.pipelineValue}
              format="currency"
              icon={Activity}
              color="orange"
              isLoading={isLoading}
            />
          )}
          {isEnabled('kpi_conversion') && (
            <KPIWidget
              title="Taxa de Conversão"
              value={analytics.conversionRate}
              format="percent"
              icon={Target}
              color="purple"
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-lg)]">
        {/* Growth Chart */}
        {isEnabled('contact_growth') && (
          <div className="p-[var(--spacing-md)] bg-[var(--color-background-primary)] rounded-xl border border-[var(--color-border-default)]">
            <h3 className="font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)] flex items-center gap-[var(--spacing-sm)]">
              <TrendingUp className="w-4 h-4 text-[var(--color-interactive-default)]" aria-hidden="true" />
              Crescimento de Contatos (6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.months} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="contatos"
                  stroke="#3b82f6"
                  fill="rgba(59,130,246,0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pipeline by Stage */}
        {isEnabled('sales_pipeline') && (
          <div className="p-[var(--spacing-md)] bg-[var(--color-background-primary)] rounded-xl border border-[var(--color-border-default)]">
            <h3 className="font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)] flex items-center gap-[var(--spacing-sm)]">
              <Activity className="w-4 h-4 text-green-600" aria-hidden="true" />
              Pipeline por Estágio
            </h3>
            {analytics.pipelineByStage.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.pipelineByStage} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                Nenhuma oportunidade registrada
              </div>
            )}
          </div>
        )}

        {/* Tag Distribution */}
        {isEnabled('tag_distribution') && analytics.tagDistribution.length > 0 && (
          <div className="p-[var(--spacing-md)] bg-[var(--color-background-primary)] rounded-xl border border-[var(--color-border-default)]">
            <h3 className="font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)]">
              Distribuição de Tags
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.tagDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                  {analytics.tagDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Breakdown */}
        {isEnabled('kpi_contacts') && analytics.statusBreakdown.length > 0 && (
          <div className="p-[var(--spacing-md)] bg-[var(--color-background-primary)] rounded-xl border border-[var(--color-border-default)]">
            <h3 className="font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)]">
              Status de Contatos
            </h3>
            <div className="space-y-[var(--spacing-md)]">
              {analytics.statusBreakdown.map((item, i) => {
                const pct = analytics.totalContacts > 0
                  ? (item.count / analytics.totalContacts) * 100
                  : 0;
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300 capitalize">{item.status}</span>
                      <span className="text-slate-500 dark:text-slate-400">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: CHART_COLORS[i],
                        }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.status}: ${pct.toFixed(0)}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Predictive AI */}
      {isEnabled('predictive') && (
        <PredictiveReport
          metrics={analytics}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}