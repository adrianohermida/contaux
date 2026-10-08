import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/PageNotFound';

const PIPELINE_STAGES = [
  { id: 'prospect', label: 'Prospect', color: 'bg-slate-100 border-slate-300' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-100 border-blue-300' },
  { id: 'proposal', label: 'Proposal', color: 'bg-amber-100 border-amber-300' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-purple-100 border-purple-300' },
  { id: 'won', label: 'Won', color: 'bg-green-100 border-green-300' },
  { id: 'lost', label: 'Lost', color: 'bg-red-100 border-red-300' }
];

const PROBABILITY_MAP = {
  prospect: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  won: 100,
  lost: 0
};

function OpportunityCard({ opp, onDragStart, stage }) {
  const scoreColor = opp.lead_score >= 70 ? 'bg-red-500' : opp.lead_score >= 30 ? 'bg-amber-500' : 'bg-blue-500';
  const scoreLabel = opp.lead_score >= 70 ? '🔥 Hot' : opp.lead_score >= 30 ? '🟡 Warm' : '❄️ Cold';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, opp.id, stage)}
      className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-move transition-shadow mb-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{opp.opportunity_name}</p>
          <p className="text-xs text-gray-500 truncate">{opp.contact_id}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full text-white whitespace-nowrap ${scoreColor}`}>
          {scoreLabel}
        </span>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-sm font-semibold text-gray-900">{formatCurrency(opp.deal_value)}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${opp.conversion_probability}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 ml-2">{opp.conversion_probability}%</span>
        </div>
      </div>
    </div>
  );
}

function PipelineColumn({ stage, opportunities, onDragStart, onDragOver, onDrop, totalValue }) {
  const stageConfig = PIPELINE_STAGES.find(s => s.id === stage);

  return (
    <div className="flex-1 min-w-[280px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{stageConfig.label}</h3>
        <div className="text-xs text-gray-500 mt-1">
          <p>{opportunities.length} opportunities</p>
          <p className="font-medium text-gray-700">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, stage)}
        className={`flex-1 ${stageConfig.color} border-2 border-dashed rounded-lg p-3 transition-colors`}
      >
        <div className="space-y-0">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              onDragStart={onDragStart}
              stage={stage}
            />
          ))}
          {opportunities.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">Drop opportunities here</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SalesPipelineWidget({ workspaceId }) {
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState(null);

  // Fetch opportunities
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['sales-pipeline', workspaceId],
    queryFn: async () => {
      const opps = await base44.entities.SalesOpportunity.filter({
        workspace_id: workspaceId,
        is_active: true
      });
      return opps || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Update stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async ({ oppId, newStage }) => {
      const opp = opportunities.find(o => o.id === oppId);
      if (!opp) return;

      const oldStage = opp.pipeline_stage;
      const newProbability = PROBABILITY_MAP[newStage] || opp.conversion_probability;

      // Update opportunity
      await base44.entities.SalesOpportunity.update(oppId, {
        pipeline_stage: newStage,
        conversion_probability: newProbability,
        last_activity_date: new Date().toISOString().split('T')[0]
      });

      // Create activity log
      await base44.entities.SalesActivity.create({
        workspace_id: workspaceId,
        opportunity_id: oppId,
        activity_type: 'stage_change',
        from_stage: oldStage,
        to_stage: newStage,
        description: `Moved from ${oldStage} to ${newStage}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-pipeline', workspaceId] });
    },
  });

  const handleDragStart = useCallback((e, oppId, stage) => {
    setDraggedItem({ oppId, fromStage: stage });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.style.opacity = '0.7';
  }, []);

  const handleDrop = useCallback((e, toStage) => {
    e.preventDefault();
    e.currentTarget.style.opacity = '1';

    if (!draggedItem) return;
    if (draggedItem.fromStage === toStage) return;

    updateStageMutation.mutate({
      oppId: draggedItem.oppId,
      newStage: toStage
    });

    setDraggedItem(null);
  }, [draggedItem, updateStageMutation]);

  // Group opportunities by stage
  const grouped = useMemo(() => {
    const result = {};
    PIPELINE_STAGES.forEach(s => {
      result[s.id] = opportunities.filter(o => o.pipeline_stage === s.id);
    });
    return result;
  }, [opportunities]);

  // Calculate totals per stage
  const stageTotals = useMemo(() => {
    const totals = {};
    Object.entries(grouped).forEach(([stage, opps]) => {
      totals[stage] = opps.reduce((sum, o) => sum + o.deal_value, 0);
    });
    return totals;
  }, [grouped]);

  // Calculate total pipeline value
  const totalPipeline = useMemo(() => {
    return opportunities.reduce((sum, o) => sum + o.deal_value, 0);
  }, [opportunities]);

  // Calculate weighted pipeline (by probability)
  const weightedPipeline = useMemo(() => {
    return opportunities.reduce((sum, o) => sum + (o.deal_value * o.conversion_probability / 100), 0);
  }, [opportunities]);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sales Pipeline - Kanban
            </CardTitle>
            <CardDescription>Drag opportunities to move between stages</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Pipeline</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPipeline)}</p>
            <p className="text-xs text-blue-600 font-semibold">
              {formatCurrency(weightedPipeline)} weighted
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage.id}
              opportunities={grouped[stage.id]}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              totalValue={stageTotals[stage.id]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}