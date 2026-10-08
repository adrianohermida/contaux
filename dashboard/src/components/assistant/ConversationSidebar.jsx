import { useState, useCallback, useEffect } from 'react'
import {
  Plus, Search, MessageSquare, Headphones, FolderClosed, FolderOpen,
  Bot, Trash2, UserCheck, Clock, ArrowLeft, ChevronRight, X, Pencil,
} from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button } from '@/components/ui/button'
import DotEditor from './DotEditor'

/**
 * Coluna esquerda do fullscreen — lista de conversas e navegação.
 * Seções: Projetos (com conversas agrupadas), Conversas com IA, Atendimentos, Assistentes.
 */
export default function ConversationSidebar({ onClose }) {
  const {
    conversations, activeConvId, openConversation, deleteConversation, clearMessages,
    queue, loadQueue, acceptHandoff, setMobileView,
    projects, createProject, deleteProject, assignConversationToProject,
    activeProjectId, setActiveProjectId,
    dots, createDot, updateDot, deleteDot, activeDotId, setActiveDotId,
  } = useAssistant()
  const [search, setSearch] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjName, setNewProjName] = useState('')
  const [dotEditorOpen, setDotEditorOpen] = useState(false)
  const [editingDot, setEditingDot] = useState(null)

  const filtered = conversations.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()),
  )

  // Conversas com IA sem projeto
  const aiConvs = filtered.filter((c) => c.conversation_kind !== 'support' && !c.project_id)
  // Conversas de IA com projeto ativo
  const projectConvs = filtered.filter((c) => c.conversation_kind !== 'support' && c.project_id)
  const supportConvs = filtered.filter((c) => c.conversation_kind === 'support')

  const handleNew = useCallback(() => {
    clearMessages()
    setMobileView('conversation')
  }, [clearMessages, setMobileView])

  const handleOpen = useCallback((id) => {
    openConversation(id)
    setMobileView('conversation')
  }, [openConversation, setMobileView])

  const handleCreateProject = useCallback(async () => {
    if (!newProjName.trim()) return
    await createProject(newProjName.trim())
    setNewProjName('')
    setShowNewProject(false)
  }, [createProject, newProjName])

  const handleSelectDot = useCallback((dot) => {
    clearMessages()
    setActiveDotId(dot.id)
    setMobileView('conversation')
  }, [clearMessages, setActiveDotId, setMobileView])

  const handleSaveDot = useCallback(async (data) => {
    if (editingDot) {
      await updateDot(editingDot.id, data)
    } else {
      await createDot(data)
    }
    setDotEditorOpen(false)
    setEditingDot(null)
  }, [editingDot, updateDot, createDot])

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
        {/* Projetos */}
        <SidebarSection title="Projetos" icon={FolderClosed} action={
          <button
            onClick={() => setShowNewProject((s) => !s)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Novo projeto"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        }>
          {showNewProject && (
            <div className="flex items-center gap-1 px-1 py-1">
              <input
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                placeholder="Nome do projeto"
                autoFocus
                className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button onClick={handleCreateProject} className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                OK
              </button>
              <button onClick={() => setShowNewProject(false)} className="rounded p-1 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {projects.length === 0 && !showNewProject ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              Nenhum projeto. Clique em + para criar.
            </p>
          ) : (
            projects.map((proj) => {
              const projConvs = projectConvs.filter((c) => c.project_id === proj.id)
              const isActive = activeProjectId === proj.id
              return (
                <div key={proj.id}>
                  <div
                    className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors ${
                      isActive ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                  >
                    <button
                      onClick={() => setActiveProjectId(isActive ? null : proj.id)}
                      className="flex flex-1 items-center gap-1.5 text-left min-w-0"
                    >
                      <ChevronRight
                        className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${isActive ? 'rotate-90' : ''}`}
                      />
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: proj.color || '#3763EB' }}
                      />
                      <span className="truncate text-sm font-medium">{proj.name}</span>
                      <span className="text-[10px] text-muted-foreground">{projConvs.length}</span>
                    </button>
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label="Excluir projeto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {isActive && (
                    <div className="ml-4 space-y-0.5 border-l border-border pl-1">
                      {projConvs.length === 0 ? (
                        <p className="px-2 py-1 text-[11px] text-muted-foreground">Sem conversas</p>
                      ) : (
                        projConvs.map((conv) => (
                          <ConvItem
                            key={conv.id}
                            conv={conv}
                            active={activeConvId === conv.id}
                            onOpen={() => handleOpen(conv.id)}
                            onDelete={() => deleteConversation(conv.id)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </SidebarSection>

        {/* Conversas com IA (sem projeto) */}
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

        {/* Assistentes (dots) */}
        <SidebarSection title="Assistentes" icon={Bot} action={
          <button
            onClick={() => { setEditingDot(null); setDotEditorOpen(true) }}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Novo assistente"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        }>
          {dots.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              Nenhum assistente. Clique em + para criar.
            </p>
          ) : (
            dots.filter((d) => d.is_active).map((dot) => (
              <div
                key={dot.id}
                className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
                  activeDotId === dot.id ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
              >
                <button
                  onClick={() => handleSelectDot(dot)}
                  className="flex flex-1 items-center gap-2 text-left min-w-0"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: dot.color + '20', color: dot.color }}
                  >
                    <Bot className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{dot.name}</p>
                    {dot.description && (
                      <p className="truncate text-[10px] text-muted-foreground">{dot.description}</p>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => { setEditingDot(dot); setDotEditorOpen(true) }}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  aria-label="Editar assistente"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => deleteDot(dot.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  aria-label="Excluir assistente"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </SidebarSection>
      </div>
      <DotEditor
        open={dotEditorOpen}
        dot={editingDot}
        onSave={handleSaveDot}
        onClose={() => { setDotEditorOpen(false); setEditingDot(null) }}
      />
    </div>
  )
}

/** Seção colapsável com título e ícone */
function SidebarSection({ title, icon: Icon, children, action }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {title}
        <div className="ml-auto">{action}</div>
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
