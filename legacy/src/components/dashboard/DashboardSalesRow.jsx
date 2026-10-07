import React from 'react';
import SalesPipelineWidget from './widgets/SalesPipelineWidget';
import LeadScoringWidget from './widgets/LeadScoringWidget';
import RevenueForecastWidget from './widgets/RevenueForecastWidget';
import PipelinePerformanceWidget from './widgets/PipelinePerformanceWidget';

export default function DashboardSalesRow({ workspaceId }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <SalesPipelineWidget workspaceId={workspaceId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeadScoringWidget workspaceId={workspaceId} />
        <div className="md:col-span-2">
          <RevenueForecastWidget workspaceId={workspaceId} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PipelinePerformanceWidget workspaceId={workspaceId} />
      </div>
    </>
  );
}