import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Trash2, Maximize2, Minimize2, Send, FileText, Scale, BookOpen, HelpCircle } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const typeIcons = {
  article: FileText,
  legislation: Scale,
  book: BookOpen,
  faq: HelpCircle,
}

/**
 * Painel do Assistente Contaux.
 * Integração real com /api/knowledge-base/ask.
 */
export default function AssistantPanel({ onClose, onFullscreen, fullscreen = false }) {
  const { messages, draft, setDraft, clearMessages, sendMessage, context, status } = useAssistant()
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const preparing = status === 'preparing'

  useEffect(() => {
    if (!fullscreen) inputRef.current?.focus()
  }, [fullscreen])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (draft.trim() && !preparing) sendMessage(draft)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (draft.trim() && !preparing) sendMessage(draft)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">Assistente Contaux</h2>
            <span className="text-xs font-medium text-muted-foreground">Base de Conhecimento</span>
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">Assistente Contaux</p>
            <p className="text-xs text-muted-foreground max-w-[260px]">
              Pergunte sobre legislação, normas contábeis (NBCs) ou artigos da base de conhecimento.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full max-w-[90%] space-y-2">
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.sources?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((s, j) => {
                        const Icon = typeIcons[s.type] || FileText
                        return (
                          <span key={j} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            <Icon className="h-3 w-3" /> {s.title?.substring(0, 35)}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        {preparing && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-muted px-3 py-2">
              <Spinner />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-border p-3">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre a base de conhecimento..."
          rows={2}
          disabled={preparing}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
        <Button type="submit" size="sm" disabled={preparing || !draft.trim()} className="mt-2 w-full">
          <Send className="h-4 w-4 mr-1.5" />
          {preparing ? 'Consultando...' : 'Enviar'}
        </Button>
      </form>
    </div>
  )
}
