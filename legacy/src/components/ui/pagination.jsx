import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Pagination({ currentPage, totalPages, onPageChange, hasPrev, hasNext }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-[var(--spacing-sm)] mt-[var(--spacing-lg)]">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        variant="outline"
        size="sm"
        className="gap-[var(--spacing-xs)]"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>

      <div className="flex gap-[var(--spacing-xs)]">
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        variant="outline"
        size="sm"
        className="gap-[var(--spacing-xs)]"
      >
        Próxima
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}