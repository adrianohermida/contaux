import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProtectedRoute from '../components/dashboard/ProtectedRoute';
import CSVUploadForm from '../components/dashboard/CSVUploadForm';

export default function ImportCSV() {
  const [tenantId, setTenantId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const getCurrentTenant = async () => {
      try {
        const user = await base44.auth.me();
        setTenantId(user.email.split('@')[0]);
      } catch (error) {
        console.error('Erro ao obter tenant:', error);
      }
    };
    getCurrentTenant();
  }, []);

  if (!tenantId) return <ProtectedRoute><DashboardLayout><div className="text-center py-8">Carregando...</div></DashboardLayout></ProtectedRoute>;

  return (
    <div className="space-y-[var(--spacing-lg)] max-w-2xl">
      <div>
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Importação CSV</h1>
        <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Importar dados contábeis</p>
      </div>

      <CSVUploadForm
        tenantId={tenantId}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}