import { cn } from '@/lib/utils'

export function Checkbox({ className, checked, onChange, disabled, ...props }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'h-4 w-4 rounded border-input text-primary shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
