import { cn } from '@/lib/utils'

/**
 * Estado vio para listas e tabelas sem dados.
 * @param {object} props
 * @param {string} props.icon - Nome do icone Lucide (componente)
 * @param {string} props.title - Tulo do estado vio
 * @param {string} props.description - Descri opcional
 * @param {React.ReactNode} props.action - Botou a opcional
 */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
