import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const ReportsOperationsPage = React.lazy(() => import('../../pages/ReportsOperations'));

export default function LazyReportsOperations() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-slate-600 dark:text-slate-400">Carregando Relatórios Operacionais...</p>
          </div>
        </div>
      }
    >
      <ReportsOperationsPage />
    </Suspense>
  );
}