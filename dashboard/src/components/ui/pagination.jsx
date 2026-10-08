import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Paginação simples para listas e tabelas.
 * @param {number} page - Página atual (1-based)
 * @param {number} totalPages - Total de páginas
 * @param {function} onPageChange - Callback(page)
 */
export function Pagination({ page, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null

  const pages = getPageRange(page, totalPages)

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Paginação">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors',
              p === page
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-accent',
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

function getPageRange(current, total) {
  const delta = 1
  const range = []
  const rangeWithDots = []

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  let prev = null
  for (const p of range) {
    if (prev && p - prev > 1) rangeWithDots.push('...')
    rangeWithDots.push(p)
    prev = p
  }

  return rangeWithDots
}
