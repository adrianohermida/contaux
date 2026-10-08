import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Wrapper para lazy loading de páginas pesadas
 * Centraliza loading state e error handling
 */
export function LazyPageWrapper({ component: Component, fallback = null }) {
  const LazyComponent = lazy(() => Component);

  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          </div>
        )
      }
    >
      <LazyComponent />
    </Suspense>
  );
}

/**
 * Factory para criar lazy pages facilmente
 * Uso: const BlogManagerPage = createLazyPage(() => import('./blog/BlogManager'))
 */
export function createLazyPage(importFunc, fallback) {
  const Component = lazy(importFunc);
  
  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <Component />
    </Suspense>
  );
}

/**
 * Loading fallback padrão
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando página...</p>
      </div>
    </div>
  );
}