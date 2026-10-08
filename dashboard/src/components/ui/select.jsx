import { cn } from '@/lib/utils'

export function Select({ className, children, error, ...props }) {
  return (
    <select
      aria-invalid={error ? 'true' : undefined}
      className={cn(
        'flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
