import { X, AlertCircle, ArrowRight } from 'lucide-react'
import { useAssistant } from './AssistantProvider'

/**
 * Sugestões proativas internas (CQ-07).
 * Exibe alertas operacionais (faturas vencidas, tickets abertos, etc.)
 * com botões de dispensar e agir. Deduplicação no backend.
 */
export default function ProactiveSuggestions() {
  const { proactiveSuggestions, dismissProactive, actOnProactive } = useAssistant()

  if (!proactiveSuggestions || proactiveSuggestions.length === 0) return null

  return (
    <div className="space-y-1.5 px-3 pt-2">
      {proactiveSuggestions.map((s) => (
        <div
          key={s.id}
          className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-2"
        >
          <div className="flex items-start gap-1.5">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground">{s.title}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{s.body}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  onClick={() => actOnProactive(s.id)}
                  className="inline-flex items-center gap-0.5 rounded text-[10px] font-medium text-primary hover:underline"
                >
                  {s.action_label || 'Ver'}
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={() => dismissProactive(s.id)}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Dispensar
                </button>
              </div>
            </div>
            <button
              onClick={() => dismissProactive(s.id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Dispensar"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
