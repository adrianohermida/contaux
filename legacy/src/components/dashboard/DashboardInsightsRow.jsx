import React from 'react';
import AIInsightsWidget from './widgets/AIInsightsWidget';
import EnrichmentSuggestionsWidget from './widgets/EnrichmentSuggestionsWidget';
import CustomerHealthWidget from './widgets/CustomerHealthWidget';
import RetentionRiskWidget from './widgets/RetentionRiskWidget';
import CustomerJourneyWidget from './widgets/CustomerJourneyWidget';

export default function DashboardInsightsRow({ workspaceId }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIInsightsWidget workspaceId={workspaceId} />
        <EnrichmentSuggestionsWidget workspaceId={workspaceId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomerHealthWidget workspaceId={workspaceId} />
        <RetentionRiskWidget workspaceId={workspaceId} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CustomerJourneyWidget workspaceId={workspaceId} />
      </div>
    </>
  );
}