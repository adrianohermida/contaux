import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Trash2, Maximize2, Minimize2 } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button } from '@/components/ui/button'

/**
 * Painel do Assistente Contaux.
 * Estado padrão: unavailable (sem IA conectada).
 * Não usa fixtures no runtime — mostra estado vazio/não configurado.
 */
export default function AssistantPanel({ onClose, onFullscreen, fullscreen = false }) {
  const { messages, draft, setDraft, clearMessages, context, status } = useAssistant()
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!fullscreen) inputRef.current?.focus()
  }, [fullscreen])

  // Auto-rolar para o final ao receber mensagens
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Sem envio real — assistente indisponível
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Cabeçalho */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">Assistente Contaux</h2>
            <span className="text-xs font-medium text-muted-foreground">Indisponível</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearMessages} aria-label="Limpar conversa" className="h-8 w-8">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          {onFullscreen && !fullscreen && (
            <Button variant="ghost" size="icon" onClick={onFullscreen} aria-label="Tela cheia" className="h-8 w-8">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          {fullscreen && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Sair de tela cheia" className="h-8 w-8">
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar assistente" className="h-8 w-8">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      {/* Faixa de contexto explícito */}
      <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-2 text-xs space-y-0.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contador:</span>
          <span className="font-medium">{context.actor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Empresa:</span>
          <span className="font-medium text-muted-foreground">{context.company || 'Não selecionada'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Competência:</span>
          <span className="font-medium text-muted-foreground">{context.period || 'Não informada'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rota atual:</span>
          <span className="font-mono text-muted-foreground">{context.route}</span>
        </div>
      </div>

      {/* Conversa */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">Assistente Contaux</p>
            <p className="text-xs text-muted-foreground max-w-[260px]">
              O assistente ainda não está configurado. A integração com IA será ativada em breve.
              Por enquanto, você pode navegar normalmente pelo portal.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compositor — desabilitado enquanto assistente estiver indisponível */}
      <div className="shrink-0 border-t border-border p-3">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Assistente indisponível"
          rows={2}
          disabled
          className="w-full resize-none rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground focus-visible:outline-none"
        />
      </div>

      {/* Rodapé discreto */}
      <footer className="shrink-0 border-t border-border px-4 py-2">
        <p className="text-center text-xs text-muted-foreground">
          Não configurado — aguardando integração de IA.
        </p>
      </footer>
    </div>
  )
}
