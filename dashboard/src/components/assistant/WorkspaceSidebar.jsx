import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus, Search, FolderKanban, Bot, Headphones, Sparkles,
  ChevronRight, MessageSquare, Clock, UserCheck, Trash2,
} from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

/**
 * Coluna esquerda do workspace de comunicação em fullscreen.
 * Nova conversa, busca e seções: Projetos, Conversas com IA, Atendimentos, Assistentes.
 * A lista permanece visível enquanto a conversa está aberta no desktop.
 */
export default function WorkspaceSidebar({ onSelectConversation, onNewConversation }) {
  const {
    conversations, activeConvId, openConversation, clearMessages, deleteConversation,
    queue, loadQueue, acceptHandoff, convStatus,
  } = useAssistant()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState({ projects: true, ai: false, support: false, assistants: true })

  const isStaff = user && ['admin', 'superadmin', 'accountant'].includes(user.role)

  // Carrega fila para staff
  useEffect(() => {
    if (isStaff) loadQueue()
  }, [isStaff, loadQueue])

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter((c) => c.title?.toLowerCase().includes(q))
  }, [conversations, search])

  const aiConvs = filtered.filter(
    (c) => (c.conversation_kind === 'ai' || (!c.conversation_kind && c.status === 'active')),
  )
  const supportConvs = filtered.filter(
    (c) => c.conversation_kind === 'support' || ['waiting_human', 'with_human', 'closed'].includes(c.status),
  )

  // Fila: itens não presentes nas conversas do usuário (ainda não é participante)
  const supportIds = new Set(supportConvs.map((c) => c.id))
  const queueItems = queue.filter((c) => !supportIds.has(c.id))

  const handleSelect = useCallback((convId) => {
    openConversation(convId)
    onSelectConversation?.()
  }, [openConversation, onSelectConversation])

  const handleNew = useCallback(() => {
    clearMessages()
    onNewConversation?.()
  }, [clearMessages, onNewConversation])

  const handleAccept = useCallback(async (convId) => {
    await acceptHandoff(convId)
    await openConversation(convId)
    onSelectConversation?.()
  }, [acceptHandoff, openConversation, onSelectConversation])

  const toggle = (key) => setCollapsed((p) => ({ ...p, [key]: !p[key] }))

  const SectionHeader = ({ icon: Icon, label, count, sectionKey, accent }) => (
    <button
      onClick={() => toggle(sectionKey)}
      className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
    >
      <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${!collapsed[sectionKey] ? 'rotate-90' : ''}`} />
      <Icon className={`h-3.5 w-3.5 shrink-0 ${accent || ''}`} />
      <span className="flex-1">{label}</span>
      {count > 0 && (
        <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium">{count}</span>
      )}
    </button>
  )

  const ConvItem = ({ conv, onDelete }) => (
    <div
      className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors ${
        activeConvId === conv.id ? 'bg-accent' : 'hover:bg-accent/50'
      }`}
    >
      <button onClick={() => handleSelect(conv.id)} className="flex flex-1 items-center gap-2 text-left min-w-0">
        <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs">{conv.title}</p>
          <p className="text-[10px] text-muted-foreground">
            {conv.message_count > 0 ? `${conv.message_count} msg` : 'Vazia'}
          </p>
        </div>
      </button>
      {onDelete && (
        <button
          onClick={() => deleteConversation(conv.id)}
          className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
          aria-label="Excluir"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  )

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Nova conversa + busca */}
      <div className="shrink-0 space-y-2 border-b border-border p-2.5">
        <Button size="sm" className="w-full justify-start" onClick={handleNew}>
          <Plus className="h-4 w-4 mr-1.5" /> Nova conversa
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversas..."
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Seções */}
      <div className="flex-1 overflow-y-auto px-1.5 py-2 space-y-1">
        {/* Projetos */}
        <SectionHeader icon={FolderKanban} label="Projetos" count={0} sectionKey="projects" />
        {!collapsed.projects && (
          <p className="px-3 py-2 text-[10px] text-muted-foreground italic">Em breve</p>
        )}

        {/* Conversas com IA */}
        <SectionHeader icon={Bot} label="Conversas com IA" count={aiConvs.length} sectionKey="ai" accent="text-primary" />
        {!collapsed.ai && (
          <div className="space-y-0.5">
            {aiConvs.length === 0 ? (
              <p className="px-3 py-2 text-[10px] text-muted-foreground">Nenhuma conversa com IA.</p>
            ) : (
              aiConvs.map((c) => <ConvItem key={c.id} conv={c} onDelete />)
            )}
          </div>
        )}

        {/* Atendimentos */}
        <SectionHeader icon={Headphones} label="Atendimentos" count={supportConvs.length + queueItems.length} sectionKey="support" accent="text-amber-500" />
        {!collapsed.support && (
          <div className="space-y-0.5">
            {queueItems.length > 0 && (
              <div className="space-y-1 pb-1">
                {queueItems.map((c) => (
                  <div key={c.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2">
                    <p className="truncate text-xs font-medium">{c.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(c.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      <MessageSquare className="h-2.5 w-2.5 ml-1" />
                      {c.msg_count || 0}
                    </div>
                    <Button size="sm" className="mt-1.5 h-6 w-full text-[11px]" onClick={() => handleAccept(c.id)}>
                      <UserCheck className="h-3 w-3 mr-1" /> Assumir
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {supportConvs.length === 0 && queueItems.length === 0 ? (
              <p className="px-3 py-2 text-[10px] text-muted-foreground">Nenhum atendimento.</p>
            ) : (
              supportConvs.map((c) => <ConvItem key={c.id} conv={c} />)
            )}
          </div>
        )}

        {/* Assistentes */}
        <SectionHeader icon={Sparkles} label="Assistentes" count={0} sectionKey="assistants" accent="text-violet-500" />
        {!collapsed.assistants && (
          <p className="px-3 py-2 text-[10px] text-muted-foreground italic">Em breve</p>
        )}
      </div>
    </div>
  )
}
