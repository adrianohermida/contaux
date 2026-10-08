import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Wrapper para Suspense - exibe loading ao carregar páginas lazy
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-slate-600">Carregando módulo...</p>
    </div>
  </div>
);

export default function LazyPageWrapper({ children }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}