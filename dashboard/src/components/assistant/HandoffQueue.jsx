import { useState, useCallback, useEffect, useRef } from 'react'
import { Headphones, ArrowLeft, UserCheck, Clock, MessageSquare } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button } from '@/components/ui/button'

/**
 * Fila de atendimento humano (CQ-04) — staff vê conversas aguardando handoff.
 * Overlay dentro do AssistantPanel, acessível via botão de headset.
 */
export default function HandoffQueue({ onClose }) {
  const { queue, loadQueue, acceptHandoff, openConversation } = useAssistant()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await loadQueue()
    } catch (e) {
      setError('Erro ao carregar fila')
    } finally {
      setLoading(false)
    }
  }, [loadQueue])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 10000)
    return () => clearInterval(interval)
  }, [refresh])

  const handleAccept = async (convId) => {
    try {
      await acceptHandoff(convId)
      await openConversation(convId)
      onClose()
    } catch (e) {
      setError('Erro ao aceitar atendimento')
    }
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Fila de Atendimento</h2>
          {queue.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
              {queue.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" onClick={refresh} className="h-7 w-7" title="Atualizar">
            <Clock className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {loading ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">Carregando...</p>
        ) : error ? (
          <p className="px-2 py-6 text-center text-xs text-destructive">{error}</p>
        ) : queue.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center px-4">
            <Headphones className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              Nenhuma conversa aguardando atendimento.
            </p>
          </div>
        ) : (
          queue.map((conv) => (
            <div
              key={conv.id}
              className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{conv.title}</p>
                  {conv.visitor_name && (
                    <p className="text-[10px] text-muted-foreground">
                      Visitante: {conv.visitor_name}
                    </p>
                  )}
                  {conv.handoff_reason && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground italic">
                      {conv.handoff_reason}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="h-2.5 w-2.5" />
                      {conv.msg_count || 0} msg
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(conv.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-2 h-7 w-full text-xs"
                onClick={() => handleAccept(conv.id)}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Assumir atendimento
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
