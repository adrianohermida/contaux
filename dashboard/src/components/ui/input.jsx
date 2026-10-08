import { cn } from '@/lib/utils'

export function Input({ className, error, ...props }) {
  return (
    <input
      aria-invalid={error ? 'true' : undefined}
      className={cn(
        'flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input',
        className,
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-sm font-medium leading-none text-foreground', className)}
      {...props}
    />
  )
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      aria-invalid={error ? 'true' : undefined}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input',
        className,
      )}
      {...props}
    />
  )
}
