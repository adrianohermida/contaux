import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TenantMetricsContext = createContext();

export function TenantMetricsProvider({ children, tenantId }) {
  const [metrics, setMetrics] = useState({
    invoices: [],
    payments: [],
    clients: [],
    processes: [],
    tickets: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshMetrics = useCallback(async () => {
    if (!tenantId) return;

    try {
      const [invoices, payments, clients, processes, tickets] = await Promise.all([
        base44.entities.Invoice.filter({ tenant_id: tenantId }),
        base44.entities.Payment.filter({ tenant_id: tenantId }),
        base44.entities.Client.filter({ tenant_id: tenantId }),
        base44.entities.LegalProcess?.filter({ tenant_id: tenantId }) || [],
        base44.entities.Ticket?.filter({ tenant_id: tenantId }) || []
      ]);

      setMetrics({ invoices, payments, clients, processes, tickets });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  const value = {
    metrics,
    loading,
    lastUpdated,
    refreshMetrics
  };

  return (
    <TenantMetricsContext.Provider value={value}>
      {children}
    </TenantMetricsContext.Provider>
  );
}

export function useTenantMetrics() {
  const context = useContext(TenantMetricsContext);
  if (!context) {
    throw new Error('useTenantMetrics deve ser usado dentro de TenantMetricsProvider');
  }
  return context;
}