import { cn } from '@/lib/utils'

/** Esqueleto de carregamento para cards e linhas. */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

/** Linha de tabela em estado de carregamento. */
export function SkeletonRow({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/** Card de estatisticas em estado de carregamento. */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}
