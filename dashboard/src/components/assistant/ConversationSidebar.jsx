import { useState, useCallback, useEffect } from 'react'
import { Plus, Search, MessageSquare, Headphones, FolderClosed, Bot, Trash2, UserCheck, Clock, ArrowLeft } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button } from '@/components/ui/button'

/**
 * Coluna esquerda do fullscreen — lista de conversas e navegação.
 * Seções: Projetos (placeholder), Conversas com IA, Atendimentos, Assistentes (placeholder).
 */
export default function ConversationSidebar({ onClose }) {
  const {
    conversations, activeConvId, openConversation, deleteConversation, clearMessages,
    queue, loadQueue, acceptHandoff, setMobileView,
  } = useAssistant()
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()),
  )
  const aiConvs = filtered.filter((c) => c.conversation_kind !== 'support')
  const supportConvs = filtered.filter((c) => c.conversation_kind === 'support')

  const handleNew = useCallback(() => {
    clearMessages()
    setMobileView('conversation')
  }, [clearMessages, setMobileView])

  const handleOpen = useCallback((id) => {
    openConversation(id)
    setMobileView('conversation')
  }, [openConversation, setMobileView])

  // Atualiza fila periodicamente
  useEffect(() => {
    loadQueue()
    const t = setInterval(loadQueue, 15000)
    return () => clearInterval(t)
  }, [loadQueue])

  return (
    <div className="flex h-full flex-col">
      {/* Cabeçalho: título, nova conversa, busca */}
      <div className="shrink-0 border-b border-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Workspace</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 lg:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <button
          onClick={handleNew}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
        >
          <Plus className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">Nova conversa</span>
        </button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversas..."
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Seções scrolláveis */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Projetos — placeholder */}
        <SidebarSection title="Projetos" icon={FolderClosed}>
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Em breve</p>
        </SidebarSection>

        {/* Conversas com IA */}
        <SidebarSection title="Conversas com IA" icon={Bot}>
          {aiConvs.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">Nenhuma conversa</p>
          ) : (
            aiConvs.map((conv) => (
              <ConvItem
                key={conv.id}
                conv={conv}
                active={activeConvId === conv.id}
                onOpen={() => handleOpen(conv.id)}
                onDelete={() => deleteConversation(conv.id)}
              />
            ))
          )}
        </SidebarSection>

        {/* Atendimentos */}
        <SidebarSection title="Atendimentos" icon={Headphones}>
          {supportConvs.length === 0 && queue.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">Nenhum atendimento</p>
          ) : (
            <>
              {queue.map((conv) => (
                <QueueItem
                  key={conv.id}
                  conv={conv}
                  onAccept={() => acceptHandoff(conv.id)}
                  onOpen={() => handleOpen(conv.id)}
                />
              ))}
              {supportConvs.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  active={activeConvId === conv.id}
                  onOpen={() => handleOpen(conv.id)}
                  onDelete={() => deleteConversation(conv.id)}
                />
              ))}
            </>
          )}
        </SidebarSection>

        {/* Assistentes (dots) — placeholder */}
        <SidebarSection title="Assistentes" icon={Bot}>
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Em breve</p>
        </SidebarSection>
      </div>
    </div>
  )
}

/** Seção colapsável com título e ícone */
function SidebarSection({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

/** Item de conversa na lista */
function ConvItem({ conv, active, onOpen, onDelete }) {
  return (
    <div
      className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
        active ? 'bg-accent' : 'hover:bg-accent/50'
      }`}
    >
      <button onClick={onOpen} className="flex flex-1 items-center gap-2 text-left min-w-0">
        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{conv.title}</p>
          <p className="text-[10px] text-muted-foreground">
            {conv.message_count > 0 ? `${conv.message_count} msg` : 'Vazia'}
          </p>
        </div>
      </button>
      <button
        onClick={onDelete}
        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        aria-label="Excluir"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}

/** Item da fila de atendimento */
function QueueItem({ conv, onAccept, onOpen }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2">
      <button onClick={onOpen} className="w-full text-left">
        <p className="truncate text-sm font-medium">{conv.title}</p>
        {conv.visitor_name && (
          <p className="text-[10px] text-muted-foreground">Visitante: {conv.visitor_name}</p>
        )}
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <MessageSquare className="h-2.5 w-2.5" />
            {conv.msg_count || 0} msg
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {new Date(conv.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </button>
      <Button size="sm" className="mt-1.5 h-7 w-full text-xs" onClick={onAccept}>
        <UserCheck className="h-3 w-3 mr-1" />
        Assumir
      </Button>
    </div>
  )
}
