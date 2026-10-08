/**
 * useChartData Hook
 * Format analytics data for Recharts visualizations
 */

import { useMemo } from 'react';

export function useChartData(invoices = [], opportunities = []) {
  // Revenue trend (last 12 months)
  const revenueTrendData = useMemo(() => {
    const data = {};
    const now = new Date();

    // Initialize 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      data[key] = 0;
    }

    // Aggregate revenue by month
    invoices.forEach(inv => {
      if (inv.status === 'paid' && inv.issue_date) {
        const date = new Date(inv.issue_date);
        const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        if (data.hasOwnProperty(key)) {
          data[key] += inv.total_amount || 0;
        }
      }
    });

    return Object.entries(data).map(([month, revenue]) => ({
      month,
      revenue: parseFloat(revenue.toFixed(2)),
    }));
  }, [invoices]);

  // Invoice status distribution
  const invoiceStatusData = useMemo(() => {
    const statuses = {};
    invoices.forEach(inv => {
      statuses[inv.status] = (statuses[inv.status] || 0) + 1;
    });

    return Object.entries(statuses).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));
  }, [invoices]);

  // Sales pipeline distribution
  const pipelineData = useMemo(() => {
    const stages = {};
    opportunities.forEach(op => {
      stages[op.pipeline_stage] = (stages[op.pipeline_stage] || 0) + op.deal_value;
    });

    return Object.entries(stages).map(([stage, value]) => ({
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      value: parseFloat(value.toFixed(2)),
    }));
  }, [opportunities]);

  // Conversion funnel
  const conversionFunnelData = useMemo(() => {
    const funnel = {
      prospect: 0,
      qualified: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
    };

    opportunities.forEach(op => {
      if (funnel.hasOwnProperty(op.pipeline_stage)) {
        funnel[op.pipeline_stage]++;
      }
    });

    return Object.entries(funnel)
      .filter(([, count]) => count > 0)
      .map(([stage, count]) => ({
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
      }));
  }, [opportunities]);

  return {
    revenueTrendData,
    invoiceStatusData,
    pipelineData,
    conversionFunnelData,
  };
}

export default useChartData;