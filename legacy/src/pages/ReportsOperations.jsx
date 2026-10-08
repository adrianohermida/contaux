import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGlobalAuth } from '@/components/auth/useGlobalAuth';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MFASetup from '@/components/dashboard/security/MFASetup';
import DataEncryption from '@/components/dashboard/security/DataEncryption';
import ComplianceReporting from '@/components/dashboard/security/ComplianceReporting';
import RoleBasedAccess from '@/components/dashboard/security/RoleBasedAccess';
import AlertingManager from '@/components/dashboard/devops/AlertingManager';
import CIPipelineManager from '@/components/dashboard/devops/CIPipelineManager';
import AdvancedMonitoringDashboard from '@/components/dashboard/monitoring/AdvancedMonitoringDashboard';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * REPORTS - OPERATIONS MODULE
 * Security, monitoring, infrastructure & DevOps
 */
export default function ReportsOperations() {
  const { workspaceId, loading: authLoading } = useGlobalAuth('internal');
  const [activeTab, setActiveTab] = useState('monitoring');

  const { isLoading: opsLoading, error: opsError, refetch } = useQuery({
    queryKey: ['reports-operations', workspaceId],
    queryFn: async () => {
      // Pre-load monitoring data if needed
      return { ready: true };
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  if (authLoading || opsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
      </div>
    );
  }

  if (opsError) {
    return (
      <div className="space-y-[var(--spacing-lg)]">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Relatórios - Operações</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-[var(--spacing-2xl)] text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-[var(--spacing-md)]" />
          <p className="text-red-600 mb-[var(--spacing-md)]">Erro ao carregar operações</p>
          <Button onClick={() => refetch()} className="gap-[var(--spacing-sm)]">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div>
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Relatórios - Operações</h1>
        <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Segurança, monitoramento e infraestrutura</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 overflow-x-auto gap-[var(--spacing-xs)]">
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
          <TabsTrigger value="devops">DevOps</TabsTrigger>
          <TabsTrigger value="rbac">RBAC</TabsTrigger>
        </TabsList>

        {/* Monitoring */}
        <TabsContent value="monitoring" className="mt-[var(--spacing-lg)]">
          {workspaceId && <AdvancedMonitoringDashboard workspaceId={workspaceId} />}
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-[var(--spacing-lg)]">
          {workspaceId && <DataEncryption workspaceId={workspaceId} />}
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="mt-[var(--spacing-lg)]">
          {workspaceId && <ComplianceReporting workspaceId={workspaceId} />}
        </TabsContent>

        {/* MFA Setup */}
        <TabsContent value="mfa" className="mt-[var(--spacing-lg)]">
          <MFASetup />
        </TabsContent>

        {/* DevOps */}
        <TabsContent value="devops" className="mt-[var(--spacing-lg)]">
          <div className="space-y-[var(--spacing-lg)]">
            <div className="grid md:grid-cols-2 gap-[var(--spacing-lg)]">
              {workspaceId && (
                <>
                  <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)]">
                    <h3 className="text-lg font-semibold mb-[var(--spacing-md)]">Alertas</h3>
                    <AlertingManager workspaceId={workspaceId} />
                  </div>
                  <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)]">
                    <h3 className="text-lg font-semibold mb-[var(--spacing-md)]">CI/CD Pipeline</h3>
                    <CIPipelineManager workspaceId={workspaceId} />
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* RBAC */}
        <TabsContent value="rbac" className="mt-[var(--spacing-lg)]">
          {workspaceId && <RoleBasedAccess workspaceId={workspaceId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}