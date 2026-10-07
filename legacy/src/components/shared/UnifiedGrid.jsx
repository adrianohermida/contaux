/**
 * UNIFIED GRID COMPONENT
 * Shared grid for both Contact and Clients pages
 * Supports different item renderers and click behaviors
 */

import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';

export default function UnifiedGrid({
  items,
  isLoading,
  renderItem,
  emptyMessage,
  onNewItem,
  onImportClick,
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  skeletonCount = 6,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}) {
  return (
    <div role="region" aria-label="Lista de itens" aria-live="polite">
      <div className={`grid ${columns} gap-[var(--spacing-sm)] sm:gap-[var(--spacing-md)]`}>
         {isLoading ? (
           Array.from({ length: skeletonCount }).map((_, i) => (
             <div key={i} className="animate-pulse bg-[var(--color-background-primary)] rounded-xl border p-[var(--spacing-lg)]">
               <div className="space-y-[var(--spacing-sm)]">
                 <div className="h-4 bg-[var(--color-background-secondary)] rounded w-3/4"></div>
                 <div className="h-3 bg-[var(--color-background-secondary)] rounded w-full"></div>
                 <div className="h-3 bg-[var(--color-background-secondary)] rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-[var(--spacing-2xl)] px-[var(--spacing-md)]">
            <p className="text-[var(--font-size-sm)] sm:text-[var(--font-size-base)] text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">{emptyMessage}</p>
            <div className="flex gap-[var(--spacing-sm)] justify-center flex-wrap">
              <Button 
                onClick={onImportClick} 
                variant="outline" 
                className="gap-2 min-h-[44px]"
                aria-label="Importar itens"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                Importar
              </Button>
              <Button 
                onClick={onNewItem} 
                variant="outline"
                className="min-h-[44px]"
                aria-label="Criar novo item"
              >
                Criar novo
              </Button>
            </div>
          </div>
        ) : (
          items.map(item => renderItem(item))
        )}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Paginação" className="mt-[var(--spacing-lg)]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />
        </nav>
      )}
    </div>
  );
}