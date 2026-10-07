/**
 * useAnalytics Hook
 * Fetch and manage analytics dashboard data
 */

import { useQuery, useQueries } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCallback, useMemo } from 'react';

export function useAnalytics(workspaceId, dateRange = { start: null, end: null }) {
  // Fetch invoices data
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', workspaceId, dateRange],
    queryFn: () => base44.entities.Invoice.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });

  // Fetch clients data
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', workspaceId],
    queryFn: () => base44.entities.Client.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });

  // Fetch opportunities data
  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities', workspaceId],
    queryFn: () => base44.entities.SalesOpportunity.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });

  // Calculate revenue metrics
  const revenueMetrics = useMemo(() => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').length;
    const pendingAmount = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    return {
      totalRevenue: totalRevenue.toFixed(2),
      paidInvoices,
      pendingInvoices,
      pendingAmount: pendingAmount.toFixed(2),
      averageInvoiceValue: (totalRevenue / (paidInvoices || 1)).toFixed(2),
    };
  }, [invoices]);

  // Calculate contact metrics
  const contactMetrics = useMemo(() => {
    const activeClients = clients.filter(c => c.status === 'active').length;
    const inactiveClients = clients.filter(c => c.status === 'inactive').length;
    const totalClients = clients.length;

    return {
      totalClients,
      activeClients,
      inactiveClients,
      growthRate: ((activeClients / (totalClients || 1)) * 100).toFixed(1),
    };
  }, [clients]);

  // Calculate sales metrics
  const salesMetrics = useMemo(() => {
    const totalOpportunities = opportunities.length;
    const wonOpportunities = opportunities.filter(op => op.pipeline_stage === 'won').length;
    const totalPipelineValue = opportunities.reduce((sum, op) => sum + (op.deal_value || 0), 0);

    return {
      totalOpportunities,
      wonOpportunities,
      winRate: ((wonOpportunities / (totalOpportunities || 1)) * 100).toFixed(1),
      totalPipelineValue: totalPipelineValue.toFixed(2),
      averageDealValue: (totalPipelineValue / (totalOpportunities || 1)).toFixed(2),
    };
  }, [opportunities]);

  return {
    revenueMetrics,
    contactMetrics,
    salesMetrics,
    rawData: { invoices, clients, opportunities },
    isLoading: false,
    error: null,
  };
}

export default useAnalytics;