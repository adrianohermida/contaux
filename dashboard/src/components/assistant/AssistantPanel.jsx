import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, Trash2, Send } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button } from '@/components/ui/button'
import AssistantMessages from './AssistantMessages'
import { DEMO_SUGGESTIONS } from './fixtures'

export default function AssistantPanel({ onClose }) {
  const { messages, sendMessage, clearMessages, context, status } = useAssistant()
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-rolar para o final ao receber mensagens
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  const handleSubmit = (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || status === 'preparing') return
    sendMessage(text)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
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
            <span className="text-xs font-medium text-warning">Demonstração</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearMessages} aria-label="Limpar conversa" className="h-8 w-8">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
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
            <p className="text-sm text-muted-foreground">Olá! Sou o Assistente Contaux (demo).</p>
            <p className="text-xs text-muted-foreground">Experimente as ações abaixo:</p>
            <div className="w-full space-y-2">
              {DEMO_SUGGESTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => sendMessage(s.label)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AssistantMessages messages={messages} onNavigate={navigate} />
            {status === 'preparing' && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Organizando o pedido...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Compositor */}
      <form onSubmit={handleSubmit} className="shrink-0 border-t border-border p-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem... (Demonstração)"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={status === 'preparing'}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || status === 'preparing'} aria-label="Enviar mensagem">
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </form>

      {/* Rodapé discreto */}
      <footer className="shrink-0 border-t border-border px-4 py-2">
        <p className="text-center text-xs text-muted-foreground">
          Modo demonstração — dados fictícios. Nenhuma IA ou API de negócio ativa.
        </p>
      </footer>
    </div>
  )
}
