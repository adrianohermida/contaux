import React from 'react';
import RecentActivityWidget from './widgets/RecentActivityWidget';
import TagPerformanceWidget from './widgets/TagPerformanceWidget';
import ContactGrowthWidget from './widgets/ContactGrowthWidget';

export default function DashboardActivityRow({ workspaceId }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityWidget workspaceId={workspaceId} />
        <TagPerformanceWidget workspaceId={workspaceId} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ContactGrowthWidget workspaceId={workspaceId} />
      </div>
    </>
  );
}