import React from 'react';
import ContactStatisticsWidget from './widgets/ContactStatisticsWidget';
import ContactTagsWidget from './widgets/ContactTagsWidget';
import DuplicateAlertsWidget from './widgets/DuplicateAlertsWidget';
import DataQualityWidget from './widgets/DataQualityWidget';

export default function DashboardStatsRow({ workspaceId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ContactStatisticsWidget workspaceId={workspaceId} />
      <ContactTagsWidget workspaceId={workspaceId} />
      <div className="grid grid-cols-1 gap-6 md:col-span-2 lg:col-span-1">
        <DuplicateAlertsWidget workspaceId={workspaceId} />
        <DataQualityWidget workspaceId={workspaceId} />
      </div>
    </div>
  );
}