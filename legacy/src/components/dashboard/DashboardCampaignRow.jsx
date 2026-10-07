import React from 'react';
import CampaignManagerWidget from './widgets/CampaignManagerWidget';
import CampaignAnalyticsWidget from './widgets/CampaignAnalyticsWidget';
import LoyaltyProgramWidget from './widgets/LoyaltyProgramWidget';
import PointsTrackerWidget from './widgets/PointsTrackerWidget';
import RedemptionDashboardWidget from './widgets/RedemptionDashboardWidget';
import ProgramAnalyticsWidget from './widgets/ProgramAnalyticsWidget';
import ChurnRiskWidget from './widgets/ChurnRiskWidget';
import ChurnAnalyticsWidget from './widgets/ChurnAnalyticsWidget';
import InterventionRecommendationWidget from './widgets/InterventionRecommendationWidget';

export default function DashboardCampaignRow({ workspaceId }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CampaignManagerWidget workspaceId={workspaceId} />
        <CampaignAnalyticsWidget workspaceId={workspaceId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LoyaltyProgramWidget workspaceId={workspaceId} />
        <PointsTrackerWidget workspaceId={workspaceId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RedemptionDashboardWidget workspaceId={workspaceId} />
        <ProgramAnalyticsWidget workspaceId={workspaceId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChurnRiskWidget workspaceId={workspaceId} />
        <ChurnAnalyticsWidget workspaceId={workspaceId} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <InterventionRecommendationWidget workspaceId={workspaceId} />
      </div>
    </>
  );
}