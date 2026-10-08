import React from 'react';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';
import DashboardStatsRow from '../components/dashboard/DashboardStatsRow';
import DashboardActivityRow from '../components/dashboard/DashboardActivityRow';
import DashboardSalesRow from '../components/dashboard/DashboardSalesRow';
import DashboardInsightsRow from '../components/dashboard/DashboardInsightsRow';
import DashboardCampaignRow from '../components/dashboard/DashboardCampaignRow';

export default function Dashboard() {
  const { workspaceId, loading } = useGlobalAuth('internal');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[var(--spacing-2xl)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-interactive-default)] border-t-transparent rounded-full animate-spin mx-auto mb-[var(--spacing-md)]" aria-busy="true" />
          <p className="text-[var(--color-foreground-secondary)]">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--spacing-lg)]">
    <div>
       <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]" role="heading" aria-level="1">Dashboard</h1>
       <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-sm)]">Visão geral do seu workspace</p>
     </div>

      <DashboardStatsRow workspaceId={workspaceId} />
      <DashboardActivityRow workspaceId={workspaceId} />
      <DashboardSalesRow workspaceId={workspaceId} />
      <DashboardInsightsRow workspaceId={workspaceId} />
      <DashboardCampaignRow workspaceId={workspaceId} />
    </div>
  );
}