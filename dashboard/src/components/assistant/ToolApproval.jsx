import { useState } from 'react'
import { CheckSquare, X, Check, Loader2 } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button } from '@/components/ui/button'

/**
 * Modal de aprovação para tools de escrita (CQ-05).
 * Mostra o que a tool vai fazer e pede confirmação do usuário.
 */
export default function ToolApproval({ toolCall, onApprove, onReject }) {
  const [executing, setExecuting] = useState(false)

  const handleApprove = async () => {
    setExecuting(true)
    await onApprove()
    setExecuting(false)
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Confirmar ação</h3>
            <p className="text-[10px] text-muted-foreground">Tool: {toolCall?.tool}</p>
          </div>
        </div>

        <div className="mb-3 rounded-lg bg-muted/50 p-2.5 text-xs">
          <p className="font-medium">{toolCall?.description || toolCall?.tool}</p>
          {toolCall?.params && (
            <dl className="mt-2 space-y-0.5">
              {Object.entries(toolCall.params).map(([k, v]) => (
                <div key={k} className="flex gap-1">
                  <dt className="text-muted-foreground">{k}:</dt>
                  <dd className="font-medium">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={executing}
            className="flex-1"
          >
            {executing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={executing}
            className="flex-1"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
