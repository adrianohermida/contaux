import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const AdvancedReportsPage = React.lazy(() => import('../../pages/ReportsAdvanced'));

export default function LazyAdvancedReports() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-slate-600 dark:text-slate-400">Carregando Relatórios Avançados...</p>
          </div>
        </div>
      }
    >
      <AdvancedReportsPage />
    </Suspense>
  );
}