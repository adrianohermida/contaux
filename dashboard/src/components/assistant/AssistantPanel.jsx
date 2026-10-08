import { useEffect } from 'react'
import { Sparkles, X, Trash2, Maximize2, Minimize2, Send, FileText, Scale, BookOpen, HelpCircle, Pin, PinOff, History, Plus, MessageSquare } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { getModuleCoverage } from './moduleCoverage'
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
 * Mostra contexto, histórico de conversas, demonstrações e integração com a base de conhecimento.
 */
export default function AssistantPanel({ onClose, onFullscreen, fullscreen = false }) {
  const {
    messages, draft, setDraft, clearMessages, sendMessage,
    context, contextMode, toggleContextMode, status,
    conversations, activeConvId, showHistory, setShowHistory,
    openConversation, deleteConversation,
  } = useAssistant()
  const preparing = status === 'preparing'
  const isFixed = contextMode === 'fixed'

  // Sugestões contextuais baseadas no módulo atual (AC-GLOBAL-03)
  const coverage = getModuleCoverage(context.route || '')
  const suggestions = coverage.suggestions

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

  const handleDemo = (prompt) => {
    if (!preparing) sendMessage(prompt)
  }

  // Painel de histórico de conversas
  if (showHistory) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Histórico de conversas</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)} aria-label="Voltar" className="h-8 w-8">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <button
            onClick={() => { clearMessages(); setShowHistory(false) }}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Nova conversa</span>
          </button>

          {conversations.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              Nenhuma conversa salva ainda.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  activeConvId === conv.id ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
              >
                <button
                  onClick={() => openConversation(conv.id)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {conv.message_count > 0 ? `${conv.message_count} mensagens` : 'Vazia'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => deleteConversation(conv.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  aria-label="Excluir conversa"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )
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
            <span className="text-xs font-medium text-muted-foreground">Base de Conhecimento</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)} aria-label="Histórico de conversas" className="h-8 w-8">
            <History className="h-4 w-4" aria-hidden="true" />
          </Button>
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

      {/* Barra de contexto com modo */}
      <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-2 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Módulo:</span>
          <span className="font-medium">{context.module}</span>
        </div>
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
        {/* Alternador de modo de contexto */}
        <button
          onClick={toggleContextMode}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
          aria-label={isFixed ? 'Destravar contexto e acompanhar a tela' : 'Travar contexto da conversa'}
        >
          {isFixed ? (
            <>
              <PinOff className="h-3 w-3" />
              Contexto travado — clicar para acompanhar a tela
            </>
          ) : (
            <>
              <Pin className="h-3 w-3" />
              Acompanhando a tela — clicar para travar contexto
            </>
          )}
        </button>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Assistente Contaux</p>
              <p className="text-xs text-muted-foreground max-w-[260px] mt-1">
                Pergunte sobre legislação, normas contábeis (NBCs) ou artigos da base de conhecimento.
              </p>
            </div>
            {/* Sugestões contextuais do módulo (AC-GLOBAL-03) */}
            <div className="w-full space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Sugestões — {context.module}
              </p>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleDemo(s.prompt)}
                  disabled={preparing}
                  className="w-full rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-left text-xs transition-colors hover:bg-primary/10 disabled:opacity-50"
                >
                  <span className="font-medium text-primary">{s.label}</span>
                  <span className="block text-muted-foreground mt-0.5">{s.description}</span>
                </button>
              ))}
              {coverage.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {coverage.capabilities.map((cap) => (
                    <span key={cap} className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {cap}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
              <Spinner size="sm" />
            </div>
          </div>
        )}
      </div>

      {/* Entrada */}
      <form onSubmit={handleSubmit} className="shrink-0 border-t border-border p-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <textarea
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
