import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function LazyPageBoundary({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-slate-600">Carregando módulo...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}