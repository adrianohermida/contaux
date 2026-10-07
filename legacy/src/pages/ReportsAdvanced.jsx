import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGlobalAuth } from '@/components/auth/useGlobalAuth';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIReportBuilder from '@/components/dashboard/analytics/AIReportBuilder';
import ScheduledReportsManager from '@/components/dashboard/analytics/ScheduledReportsManager';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * REPORTS - ADVANCED MODULE
 * AI-powered & automated reporting
 */
export default function ReportsAdvanced() {
  const { workspaceId, loading: authLoading } = useGlobalAuth('internal');
  const [activeTab, setActiveTab] = useState('ai-builder');

  const { data: advancedData, isLoading: advancedLoading, refetch, error: advancedError } = useQuery({
    queryKey: ['reports-advanced', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      try {
        // Load saved reports and scheduled items
        const savedReports = await base44.entities.Report.filter({ tenant_id: workspaceId });
        return { savedReports };
      } catch (err) {
        toast.error('Erro ao carregar relatórios avançados');
        throw err;
      }
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 15 * 60 * 1000,
    gcTime: 45 * 60 * 1000
  });

  if (authLoading || advancedLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
      </div>
    );
  }

  if (advancedError && !advancedData) {
    return (
      <div className="space-y-[var(--spacing-lg)]">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Relatórios - Avançado</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-[var(--spacing-2xl)] text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-[var(--spacing-md)]" />
          <p className="text-red-600 mb-[var(--spacing-md)]">Erro ao carregar relatórios avançados</p>
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
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Relatórios - Avançado</h1>
        <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">IA, automação e análises customizadas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-[var(--spacing-sm)]">
          <TabsTrigger value="ai-builder">IA Report Builder</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="custom">Customizados</TabsTrigger>
        </TabsList>

        {/* AI Report Builder */}
        <TabsContent value="ai-builder" className="mt-[var(--spacing-lg)]">
          {workspaceId && <AIReportBuilder workspaceId={workspaceId} />}
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="scheduled" className="mt-[var(--spacing-lg)]">
          {workspaceId && <ScheduledReportsManager workspaceId={workspaceId} />}
        </TabsContent>

        {/* Custom Reports */}
        <TabsContent value="custom" className="mt-[var(--spacing-lg)]">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-[var(--spacing-2xl)] text-center">
            <p className="text-blue-600">Seção de relatórios customizados em desenvolvimento</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}