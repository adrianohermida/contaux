/**
 * Reports Page
 * Dashboard for viewing and creating reports
 */

import React, { useState } from 'react';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';
import UnifiedHeader from '../components/shared/UnifiedHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp } from 'lucide-react';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import ReportAnalytics from '../components/reports/ReportAnalytics';

export default function Reports() {
  const { workspaceId } = useGlobalAuth('internal');
  const [activeTab, setActiveTab] = useState('analytics');

  return (
     <div className="space-y-[var(--spacing-lg)] pb-20 min-h-screen bg-[var(--color-background-primary)] transition-colors" role="main" aria-label="Página de Relatórios">
       <UnifiedHeader
         title="Relatórios"
         filteredCount={0}
         totalCount={0}
         itemName="relatório"
         hideImportExport
       />

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="grid w-full grid-cols-2 min-h-[44px] bg-[var(--color-background-secondary)] border border-[var(--color-border-default)]">
           <TabsTrigger value="analytics" className="gap-[var(--spacing-sm)] text-[var(--color-foreground-secondary)] data-[state=active]:text-[var(--color-interactive-default)]" aria-label="Aba de Análise">
             <TrendingUp className="w-4 h-4" aria-hidden="true" />
             <span className="hidden sm:inline">Análise</span>
           </TabsTrigger>
           <TabsTrigger value="reports" className="gap-[var(--spacing-sm)] text-[var(--color-foreground-secondary)] data-[state=active]:text-[var(--color-interactive-default)]" aria-label="Aba de Relatórios">
             <BarChart3 className="w-4 h-4" aria-hidden="true" />
             <span className="hidden sm:inline">Relatórios</span>
           </TabsTrigger>
         </TabsList>

         <TabsContent value="analytics" className="space-y-[var(--spacing-lg)]">
          <ReportAnalytics workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-[var(--spacing-lg)]">
          <ReportsDashboard workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}