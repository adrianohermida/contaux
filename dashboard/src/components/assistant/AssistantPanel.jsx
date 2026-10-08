import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Trash2, Maximize2, Minimize2, Send, FileText, Scale, BookOpen, HelpCircle, Pin, PinOff, History, Plus, MessageSquare, CheckSquare, Headphones, UserCheck, XCircle, Clock, Wrench } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { getModuleCoverage } from './moduleCoverage'
import TaskProposalForm from './TaskProposalForm'
import HandoffQueue from './HandoffQueue'
import ToolApproval from './ToolApproval'
import VoiceInput from './VoiceInput'
import AttachmentButton from './AttachmentButton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const typeIcons = { article: FileText, legislation: Scale, book: BookOpen, faq: HelpCircle }

/**
 * Painel do Assistente — design minimalista e compacto.
 * Header enxuto, mensagens limpas, input inline, lista de conversas como overlay.
 */
export default function AssistantPanel({ onClose, onFullscreen, fullscreen = false }) {
  const {
    messages, draft, setDraft, clearMessages, sendMessage,
    context, contextMode, toggleContextMode, status,
    conversations, activeConvId, showHistory, setShowHistory,
    openConversation, deleteConversation, createTask,
    convStatus, requestHandoff, closeConversation,
    showQueue, setShowQueue,
    availableTools, executeAssistantTool, pendingToolCall, setPendingToolCall,
    addToolMessage,
    uploadAttachment, handleVoiceTranscript,
  } = useAssistant()
  const preparing = status === 'preparing'
  const isFixed = contextMode === 'fixed'
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const scrollRef = useRef(null)

  const coverage = getModuleCoverage(context.route || '')
  const suggestions = coverage.suggestions.slice(0, 3)

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, preparing])

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

  // ===== Overlay: lista de conversas =====
  if (showHistory) {
    return (
      <div className="flex h-full flex-col bg-card">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Conversas</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          <button
            onClick={() => { clearMessages(); setShowHistory(false) }}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10 mb-1"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Nova conversa</span>
          </button>

          {conversations.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              Nenhuma conversa salva.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
                  activeConvId === conv.id ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
              >
                <button onClick={() => openConversation(conv.id)} className="flex flex-1 items-center gap-2 text-left min-w-0">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{conv.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {conv.message_count > 0 ? `${conv.message_count} msg` : 'Vazia'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => deleteConversation(conv.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  aria-label="Excluir"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // ===== Overlay: fila de atendimento (staff) =====
  if (showQueue) {
    return <HandoffQueue onClose={() => setShowQueue(false)} />
  }

  const statusLabel = {
    active: null,
    waiting_human: { text: 'Aguardando atendente', icon: Clock, color: 'text-amber-500' },
    with_human: { text: 'Com atendente', icon: UserCheck, color: 'text-green-500' },
    closed: { text: 'Encerrada', icon: XCircle, color: 'text-muted-foreground' },
  }[convStatus]

  return (
    <div className="flex h-full flex-col">
      {/* Header minimal */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">Assistente</span>
            {statusLabel ? (
              <span className={`flex items-center gap-0.5 text-[10px] ${statusLabel.color}`}>
                <statusLabel.icon className="h-2.5 w-2.5" />
                {statusLabel.text}
              </span>
            ) : (
              <button
                onClick={toggleContextMode}
                className="flex items-center gap-1 rounded text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                title={isFixed ? 'Contexto travado' : 'Acompanhando a tela'}
              >
                {isFixed ? <PinOff className="h-2.5 w-2.5" /> : <Pin className="h-2.5 w-2.5" />}
                <span className="hidden sm:inline">{context.module}</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {convStatus === 'active' && (
            <Button variant="ghost" size="icon" onClick={() => requestHandoff()} className="h-7 w-7" title="Falar com atendente">
              <Headphones className="h-3.5 w-3.5" />
            </Button>
          )}
          {convStatus === 'with_human' && (
            <Button variant="ghost" size="icon" onClick={closeConversation} className="h-7 w-7" title="Encerrar atendimento">
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setShowQueue(true)} className="h-7 w-7" title="Fila de atendimento">
            <Headphones className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowTaskForm(true)} className="h-7 w-7" title="Propor tarefa">
            <CheckSquare className="h-3.5 w-3.5" />
          </Button>
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setShowTools(!showTools)} className="h-7 w-7" title="Ferramentas">
              <Wrench className="h-3.5 w-3.5" />
            </Button>
            {showTools && (
              <div className="absolute right-0 top-9 z-20 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-lg">
                <p className="px-2 py-1 text-[10px] font-medium text-muted-foreground">Ferramentas operacionais</p>
                {availableTools.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">Nenhuma tool disponível.</p>
                ) : (
                  availableTools.map((t) => (
                    <button
                      key={t.name}
                      onClick={async () => {
                        setShowTools(false)
                        const result = await executeAssistantTool(t.name, {}, t.requiresApproval)
                        addToolMessage(t.name, result)
                      }}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{t.name}</span>
                        <p className="text-[10px] text-muted-foreground">{t.description}</p>
                        {t.requiresApproval && (
                          <span className="text-[9px] text-amber-500">⚠ Requer aprovação</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)} className="h-7 w-7" title="Conversas">
            <History className="h-3.5 w-3.5" />
          </Button>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearMessages} className="h-7 w-7" title="Limpar">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {onFullscreen && !fullscreen && (
            <Button variant="ghost" size="icon" onClick={onFullscreen} className="h-7 w-7" title="Tela cheia">
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {fullscreen && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7" title="Sair de tela cheia">
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7" title="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-2">
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Pergunte sobre legislação, NBCs ou operações do sistema.
            </p>
            <div className="w-full space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => !preparing && sendMessage(s.prompt)}
                  disabled={preparing}
                  className="w-full rounded-lg border border-border px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <span className="font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.role === 'system' ? (
                <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-[10px] text-muted-foreground">
                  {msg.text}
                </div>
              ) : msg.role === 'user' ? (
                <div className="max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-1.5 text-sm text-primary-foreground">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full max-w-[90%] space-y-1">
                  {msg.author_name && msg.author_name !== 'Assistente' && (
                    <span className="text-[10px] font-medium text-muted-foreground px-1">
                      {msg.author_name}
                    </span>
                  )}
                  <div className="rounded-lg rounded-bl-sm bg-muted px-3 py-1.5 text-sm">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.sources?.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        {msg.sources.length} fonte(s)
                      </summary>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {msg.sources.map((s, j) => {
                          const Icon = typeIcons[s.type] || FileText
                          return (
                            <span key={j} className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              <Icon className="h-2.5 w-2.5" /> {s.title?.substring(0, 30)}
                            </span>
                          )
                        })}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        {preparing && (
          <div className="flex justify-start">
            <div className="rounded-lg rounded-bl-sm bg-muted px-3 py-2">
              <Spinner size="sm" />
            </div>
          </div>
        )}
      </div>

      {/* Form de tarefa */}
      {showTaskForm && (
        <TaskProposalForm onCreate={createTask} onClose={() => setShowTaskForm(false)} />
      )}

      {/* Modal de aprovação de tool (CQ-05) */}
      {pendingToolCall && (
        <ToolApproval
          toolCall={pendingToolCall}
          onApprove={pendingToolCall.onApprove}
          onReject={pendingToolCall.onReject}
        />
      )}

      {/* Input compacto */}
      <form onSubmit={handleSubmit} className="relative shrink-0 border-t border-border p-2 flex items-end gap-1.5">
        <AttachmentButton onUpload={uploadAttachment} disabled={preparing} />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte..."
          rows={1}
          disabled={preparing}
          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          style={{ maxHeight: '80px' }}
        />
        <VoiceInput onTranscript={handleVoiceTranscript} disabled={preparing} />
        <Button type="submit" size="icon" disabled={preparing || !draft.trim()} className="h-9 w-9 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
